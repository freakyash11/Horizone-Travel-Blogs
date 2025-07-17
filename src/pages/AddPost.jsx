import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-8 mt-12'>
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark dark:text-secondary-white">
            Create New Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your travel experiences, tips, and stories with the world
          </p>
        </div>
        <PostForm />
      </Container>
    </div>
  )
}

export default AddPost