#!/usr/bin/env python3
"""Publish a successful main build to the branch watched by Argo CD."""
import json, os, pathlib, re, shutil, subprocess, tempfile

def git(*args, check=True):
    return subprocess.run(['git', *args], check=check, text=True, capture_output=True)

revision = os.environ['GITHUB_SHA']
if not re.fullmatch(r'[0-9a-f]{40}', revision):
    raise SystemExit('Invalid source revision')
if git('ls-remote', 'origin', 'refs/heads/main').stdout.split()[0] != revision:
    print('A newer main commit exists; skipping this superseded release.')
    raise SystemExit(0)
artifacts = pathlib.Path(os.environ['DIGEST_DIR'])
with tempfile.TemporaryDirectory() as tmp:
    release = pathlib.Path(tmp) / 'release'
    shutil.copytree('deploy/production', release)
    kpath = release / 'kustomization.yaml'
    manifest = json.loads(kpath.read_text())
    replacements = {}
    for path in artifacts.glob('*.json'):
        item = json.loads(path.read_text())
        if not re.fullmatch(r'sha256:[0-9a-f]{64}', item['digest']):
            raise SystemExit('Invalid image digest')
        if not item['image'].startswith('ghcr.io/' + os.environ['GITHUB_REPOSITORY'].lower()):
            raise SystemExit('Image is outside this repository namespace')
        replacements[item['name']] = {'name': item['name'], 'newName': item['image'], 'digest': item['digest']}
    if set(replacements) != {item['name'] for item in manifest['images']}:
        raise SystemExit('Incomplete build: every application image must be present')
    manifest['images'] = [replacements[item['name']] for item in manifest['images']]
    kpath.write_text(json.dumps(manifest, indent=2) + '\n')
    (release / 'source-revision.json').write_text(json.dumps({'commit': revision, 'repository': os.environ['GITHUB_REPOSITORY'], 'run': os.environ['GITHUB_RUN_ID']}, indent=2) + '\n')
    fetched = git('fetch', '--no-tags', 'origin', 'deploy', check=False)
    if fetched.returncode == 0:
        git('switch', '--force-create', 'deploy', 'FETCH_HEAD')
    else:
        # Only a genuinely absent branch may start a new history.
        refs = git('ls-remote', '--heads', 'origin', 'deploy')
        if refs.stdout.strip():
            raise SystemExit('Cannot fetch the existing deployment branch')
        git('switch', '--orphan', 'deploy')
    git('rm', '-rf', '--ignore-unmatch', '.')
    git('clean', '-fdx')
    for item in release.iterdir():
        shutil.copytree(item, item.name) if item.is_dir() else shutil.copy2(item, item.name)
    git('config', 'user.name', 'github-actions[bot]')
    git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    git('add', '--all')
    if git('diff', '--cached', '--quiet', check=False).returncode == 0:
        print('The deployment branch already contains these images.')
    else:
        git('commit', '-m', f'Deploy {revision[:12]} [skip ci]')
        git('push', 'origin', 'HEAD:deploy')
        print(f'Published immutable release for {revision}')
