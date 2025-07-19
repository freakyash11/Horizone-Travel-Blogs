import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Query } from 'appwrite';
import { useSelector } from 'react-redux';

function MyPosts() {
    const [posts, setPosts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']
    const userData = useSelector((state) => state.auth.userData);
    
    useEffect(() => {
        if (userData) {
            const userId = userData.$id;
            
            if (selectedCategory === 'All') {
                appwriteService.getPosts([
                    Query.equal("status", "active"),
                    Query.equal("userId", userId)
                ]).then((posts) => {
                    if (posts) {
                        setPosts(posts.documents)
                    }
                })
            } else {
                appwriteService.getPosts([
                    Query.equal("status", "active"),
                    Query.equal("userId", userId),
                    Query.equal("category", selectedCategory)
                ]).then((posts) => {
                    if (posts) {
                        setPosts(posts.documents)
                    }
                })
            }
        }
    }, [selectedCategory, userData])
    
    return (
        <div className='w-full py-8 mt-12'>
            <Container>
                <div className='mb-8 flex flex-wrap items-center justify-between'>
                    <h1 className='text-2xl font-bold'>My Posts</h1>
                    <div className='flex items-center space-x-4'>
                        <span className='text-gray-700'>Filter by:</span>
                        <div className='flex flex-wrap gap-2'>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                                        selectedCategory === category
                                            ? 'bg-[#3182ce] text-white'
                                            : 'bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {posts.length === 0 ? (
                    <div className="w-full py-8 text-center">
                        <div className="p-2 w-full font-bold">
                            No Posts {selectedCategory !== 'All' && `in ${selectedCategory} category`}
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {posts.map((post) => (
                            <div key={post.$id}>
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default MyPosts 