import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Query } from 'appwrite';
import { setupScrollAnimations } from '../utils/animations';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('Newest')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']
    
    // Function to sort posts based on the selected option
    const sortPosts = (posts, option) => {
        const postsToSort = [...posts]; // Create a copy to avoid mutating the original
        
        switch(option) {
            case 'Newest':
                return postsToSort.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
            case 'Oldest':
                return postsToSort.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
            case 'Most Popular':
                return postsToSort.sort((a, b) => (b.views || 0) - (a.views || 0));
            default:
                return postsToSort;
        }
    };
    
    useEffect(() => {
        setLoading(true);
        if (selectedCategory === 'All') {
            appwriteService.getPosts([Query.equal("status", "active")]).then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
        } else {
            appwriteService.getPosts([
                Query.equal("status", "active"),
                Query.equal("category", selectedCategory)
            ]).then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
        }
    }, [selectedCategory, sortOption])
    
    // Set up scroll animations when component mounts
    useEffect(() => {
        setupScrollAnimations();
        // Re-run when new content is loaded
        if (!loading) {
            setTimeout(() => {
                setupScrollAnimations();
            }, 100);
        }
    }, [loading, posts]);
    
    return (
        <div className='w-full py-8 mt-12'>
            <Container>
                <div className='mb-8 flex flex-wrap items-center justify-between'>
                    <h1 className='text-2xl font-bold'>All Posts</h1>
                    <div className='flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4'>
                        <div>
                            <span className='text-gray-700 dark:text-secondary-mediumGray mr-2'>Filter by:</span>
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            selectedCategory === category
                                                ? 'bg-primary-dark text-secondary-white dark:bg-accent-blue'
                                                : 'bg-secondary-mediumGray text-primary-dark dark:bg-primary-slate dark:text-secondary-white hover:bg-secondary-darkGray'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                            <span className='text-gray-700 dark:text-secondary-mediumGray mr-2'>Sort by:</span>
                            <select 
                                className="px-4 py-2 bg-secondary-white dark:bg-primary-charcoal rounded-md border border-secondary-mediumGray mt-2"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="Newest">Newest</option>
                                <option value="Oldest">Oldest</option>
                                <option value="Most Popular">Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="w-full py-8 text-center">
                        <div className="p-2 w-full font-bold">
                            No Posts {selectedCategory !== 'All' && `in ${selectedCategory} category`}
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray mb-6">
                            Found {posts.length} posts {selectedCategory !== 'All' && `in ${selectedCategory} category`}
                        </p>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {posts.map((post, index) => (
                            <div 
                                key={post.$id}
                                className="mb-4"
                                data-animate="scale-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <PostCard 
                                    $id={post.$id} 
                                    title={post.title} 
                                    featuredImage={post.featuredImage} 
                                    content={post.content} 
                                    $createdAt={post.$createdAt} 
                                    category={post.category} 
                                    userId={post.userId}
                                    readTime={post.readTime}
                                    views={post.views || 0}
                                />
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </Container>
        </div>
    )
}

export default AllPosts