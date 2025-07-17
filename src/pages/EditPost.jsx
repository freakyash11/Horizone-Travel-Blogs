import React, {useEffect, useState} from 'react'
import {Container, PostForm} from '../components'
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';

function EditPost() {
    const [post, setPosts] = useState(null)
    const [loading, setLoading] = useState(true)
    const {slug} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            setLoading(true)
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPosts(post)
                }
                setLoading(false)
            })
        } else {
            navigate('/')
        }
    }, [slug, navigate])

    return (
        <div className='py-8 mt-12'>
            <Container>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                    </div>
                ) : post ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-primary-dark dark:text-secondary-white">
                                Edit Blog Post
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Update your travel story and make it even better
                            </p>
                        </div>
                        <PostForm post={post} />
                    </>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-primary-dark dark:text-secondary-white mb-4">
                            Post not found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The post you're trying to edit doesn't exist or has been deleted.
                        </p>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default EditPost