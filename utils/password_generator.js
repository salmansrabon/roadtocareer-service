const  random_password_generate = (passLen)=>{
    const passwordChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const randPassword = Array(passLen).fill(passwordChars).map((x)=>x[Math.floor(Math.random()*x.length)]).join('');
    return randPassword;
}
module.exports = random_password_generate