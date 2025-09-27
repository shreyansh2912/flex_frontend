export default function Navigation(){
    return(
        <div>
            <div className="flex justify-between px-8 py-2 items-center bg-black shadow-2xl fixed w-full">
                <div className="logo text-2xl">
                    FLEX
                </div>
                <div className="flex gap-4 text-md">
                    <a href="/">Home</a>
                    <a href="/forms">forms</a>
                    <a href="/data">data</a>
                    <a href="/create-form">create</a>
                </div>
                <div className="text-md">
                    <a href="/login">Login</a> 
                </div>
            </div>
        </div>
    )
}