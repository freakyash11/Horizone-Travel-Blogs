import React, {useId} from 'react'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label 
            className='inline-block mb-1 pl-1 text-primary-dark dark:text-secondary-white' 
            htmlFor={id}>
                {label}
            </label>
            }
            <input
            type={type}
            className={`px-3 py-2 rounded-lg bg-white dark:bg-primary-slate text-primary-dark dark:text-secondary-white outline-none focus:bg-gray-50 dark:focus:bg-primary-dark duration-200 border border-secondary-mediumGray dark:border-primary-slate w-full ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})

export default Input