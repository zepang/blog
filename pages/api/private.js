export default async function handler (req, res) {
  const {
    query: { page=1 },
  } = req
  let data = await fetch(`http://www.goldenxx.com/forum/forum/theme/pageThemes.do?targetPassportId=0&themeTypeId=100031&cityId=100000&pageIndex=${page}&pageSize=10&token=eyJhbGciOiJIUzI1NiJ9.eyJjbGllbnRUeXBlIjoidXNlciIsInBhc3Nwb3J0SWQiOjEwMDkwNCwianRpIjoiMzQ4MjAyMDEyMjYxMjAzMTU0MTQ0Mzk0NzEiLCJpYXQiOjE2MDg5NTUzOTUsInN1YiI6IjEwMDkwNCIsImV4cCI6MTYwOTU2MDE5NX0.Q5i6leD4UFBGRq7bocz1WZUibVYhJAH46pPaayIOvtg`).then(res => res.json())
  res.send(data)
}