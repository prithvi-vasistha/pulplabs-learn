import { notFound } from 'next/navigation'
import ArticleDetail from '@/views/void/ArticleDetail'
import { getArticle, getArticles } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { article: slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Article not found' }

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/articles/${article.slug}` },
  }
}

export default async function Page({ params }) {
  const { article: slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const all = await getArticles()
  const index = all.findIndex((a) => a.slug === slug)
  const next = all[(index + 1) % all.length]

  return <ArticleDetail article={article} next={next?.slug === slug ? null : next} />
}
