import React, {useEffect, useState} from 'react'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { Link } from 'react-router-dom';
function Home() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        appwriteService.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])
  
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        
                        <div className="p-2 w-full">
                            <Link to = "/login">
                            {/* <h1 className="text-2xl font-bold hover:text-gray-500 cursor-pointer mt-[5rem]">
                                Login to read posts
                            </h1> */}
                            <button className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 border border-gray-600 rounded uppercase mt-12'>Create Your Blog</button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-8'>
            <h2 className='text-center mt-[50px] text-2xl font-bold uppercase'>Blogs:</h2>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home