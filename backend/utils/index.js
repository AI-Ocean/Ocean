exports.getUserID = function (claims) {
  return claims.email.split('@')[0]
}

exports.getSelector = function (claims) {
  if (claims.level <= 0) return {}
  return {
    params: {
      labelSelector: 'user=' + getUserID(claims)
    }
  }
}
