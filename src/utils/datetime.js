function addDay(date, numOfDays) {
  let result = new Date(date);
  result.setDate(result.getDate() + numOfDays);
  return result;
}

module.exports = {
  addDay
}
