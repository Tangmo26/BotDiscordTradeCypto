const secondRound = parseFloat(process.env.SECOND)
module.exports = {
    color: {
        colorGreen : "#9AD5BF",
        colorRed : "#F97C7C",
        colorYellow : "#FFFAA0"
    },
    leverage : 50,
    secondRound : secondRound,
    addValue : secondRound * 1.01282875 ,
    risk : 1.5,
}