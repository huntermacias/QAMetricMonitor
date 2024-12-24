'use client'
import React from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-800/5 to-emerald-950/60 w-full text-center text-white">
      <h1 className="text-6xl font-extrabold mb-4">
        404: Page Not Found
      </h1>
      <p className="text-xl mb-6">
        Looks like you've ventured into the void of the internet. There’s nothing here... <em>except disappointment.</em>
      </p>
      <img 
        src="https://media.giphy.com/media/3o7aD6XXFGskGxJWrK/giphy.gif" 
        alt="Confused Travolta" 
        className="w-96 mb-6 rounded-lg shadow-lg"
      />
      <p className="text-lg mb-6">
        Maybe it's time to <span className="underline text-emerald-400">build this page</span>, or maybe it’s time for a snack. You decide. 🍕
      </p>
      <Button
        onClick={() => redirect('/')}
        className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-110"
      >
        Go Back to Safety
      </Button>
    </div>
  )
}

export default NotFoundPage
