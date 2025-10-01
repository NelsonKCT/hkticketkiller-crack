let getCurrentTime = async function() {
    try {
        const timeResponse = await fetch('https://worldtimeapi.org/api/timezone/Asia/Hong_Kong');
        const timeData = await timeResponse.json();
        return timeData.unixtime;
    } catch (timeError) {
        return false;
    }
};
export async function isActive(deadline) {
    try {
        let currentTime = await getCurrentTime();
        if (!deadline || !currentTime) {
            return false;
        }
        if (currentTime > deadline) {
            return false;
        } else {
            return true;
        }
    } catch (deadlineError) {
        console.log(deadlineError);
        return true;
    }
}
export function test() {
    console.log("hey");
}