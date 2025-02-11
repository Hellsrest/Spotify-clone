const fetchmusic= async()=>{
    try{
        const response=await fetch("http://localhost:5000/activemusic");
        if(response.ok){
            const data=await response.json();
            console.log("before");
            console.log(data);
            console.log("after");
        }
    }catch(error){
        console.log("error in fetching music");
    }
}

fetchmusic();

function ActiveMusic(){
    return(
       <>
        
       </>
       
      
    );

}

export default ActiveMusic