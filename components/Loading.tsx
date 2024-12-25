import React from 'react'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


type Props = {}

const Loading = (props: Props) => {
  return (
   
    <div className="text-center items-center justify-center flex text-gray-400">
        <Skeleton height={20} count={1} />
        <p className="mt-2">Loading work items...</p>
    </div>
    
  )
}

export default Loading