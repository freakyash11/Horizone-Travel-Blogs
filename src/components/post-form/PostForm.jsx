import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import conf from "../../conf/conf";

export default function PostForm({ post }) {
    const [error, setError] = useState("");
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
            category: post?.category || "Destination",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    // Function to generate direct URL for an image
    const generateDirectImageUrl = (fileId) => {
        if (!fileId) return '';
        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    };

    const submit = async (data) => {
        try {
            setError("");
            if (post) {
                const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

                if (file) {
                    appwriteService.deleteFile(post.featuredImage);
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file ? file.$id : undefined,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                const file = await appwriteService.uploadFile(data.image[0]);

                if (file) {
                    const fileId = file.$id;
                    data.featuredImage = fileId;
                    const dbPost = await appwriteService.createPost({ ...data, userId: userData.$id });

                    if (dbPost) {
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setError(error.message || "An error occurred while saving the post");
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string") {
            // First, transform the string to lowercase and replace spaces and special chars with hyphens
            let slug = value
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, "-") // Only allow lowercase letters, numbers, periods, hyphens, underscores
                .replace(/-+/g, "-") // Replace multiple consecutive hyphens with a single one
                .replace(/^[._-]+/, ""); // Remove special chars from the beginning
            
            // Ensure it doesn't end with special chars
            slug = slug.replace(/[._-]+$/, "");
            
            // Limit to 36 characters
            slug = slug.substring(0, 36);
            
            // If slug is empty or starts with a special char after all transformations, prepend 'a'
            if (!slug || /^[._-]/.test(slug)) {
                slug = "a" + slug;
            }
            
            return slug;
        }
        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                {error && <div className="text-red-600 mb-4 p-2 bg-red-100 rounded-md">{error}</div>}
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <div className="text-sm text-gray-500 mb-4">
                    Slug must be max 36 characters with only letters, numbers, periods, hyphens, or underscores and cannot start with special characters.
                </div>
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && post.featuredImage && (
                    <div className="w-full mb-4">
                        <img
                            src={generateDirectImageUrl(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                            onError={(e) => {
                                console.log("Direct image URL failed in form, trying service URL");
                                e.target.src = appwriteService.getFilePreview(post.featuredImage);
                            }}
                        />
                    </div>
                )}
                <Select
                    options={["Destination", "Culinary", "Lifestyle", "Tips & Hacks"]}
                    label="Category"
                    className="mb-4"
                    {...register("category", { required: true })}
                />
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
