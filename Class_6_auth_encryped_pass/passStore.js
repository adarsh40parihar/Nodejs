const bcrypt = require('bcryptjs');
const password = "abcd";
async function create(){
    console.time();
    const randomSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, randomSalt)
    // const isSameotNot = await bcrypt.compare(password, hash);
    // Time Stamp
    console.timeEnd();
    console.log("hashed password", hash);
}
create();