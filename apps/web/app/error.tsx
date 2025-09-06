"use client";
export default function Error({error}:{error:Error}){return <main style={{padding:24}}><h1>500 – Something went wrong</h1><p>{error.message}</p></main>}
