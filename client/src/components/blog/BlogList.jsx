import BlogCard from './BlogCard'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'

const BlogList = ({ posts, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    )
  }

  if (error) {
    console.error('BlogList error:', error)
    return (
      <EmptyState
        title="Failed to load posts"
        description={error.message || "Something went wrong. Please try again."}
        showAction={false}
      />
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="No blog posts yet"
        description="Be the first one to share your thoughts with the community!"
        actionText="Write a blog"
        actionLink="/write"
      />
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[#1E1E1E]">
      {posts.map((post) => (
        <div key={post._id} className="py-6 first:pt-0 last:pb-0">
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  )
}

export default BlogList