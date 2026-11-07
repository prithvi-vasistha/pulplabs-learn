#!/usr/bin/env python3
"""Prevent releasing an image the cluster cannot pull anonymously."""
import json, os, pathlib, urllib.request, urllib.parse, urllib.error
for path in pathlib.Path(os.environ['DIGEST_DIR']).glob('*.json'):
    image = json.loads(path.read_text())
    name = image['image'].removeprefix('ghcr.io/')
    token_url = 'https://ghcr.io/token?' + urllib.parse.urlencode({'service': 'ghcr.io', 'scope': 'repository:' + name + ':pull'})
    try:
        with urllib.request.urlopen(token_url, timeout=30) as response:
            token = json.load(response)['token']
        request = urllib.request.Request('https://ghcr.io/v2/' + name + '/manifests/' + image['digest'], method='HEAD', headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json'})
        with urllib.request.urlopen(request, timeout=30) as response:
            assert response.status == 200
    except (urllib.error.HTTPError, urllib.error.URLError) as error:
        raise SystemExit('::error::Cluster cannot pull ' + image['image'] + '. In GitHub package settings, make this container package public, then rerun this job. Deployment was not changed. ' + str(error))
    print('Anonymous pull verified:', image['image'], image['digest'])
