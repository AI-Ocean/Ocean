module.exports = (err, req, res, next) => {
  if (err.message === 'access denied') {
    res.status(403)
    res.json({ error: err.message })
  } else if (err.message === 'abc') {
    res.status(403)
    res.json({ error: err.message })
  }
}
