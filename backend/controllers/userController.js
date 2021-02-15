// Call User model
let userDAO = require("../models/user");

module.exports.users_list = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Permission Denied.'
    })
  }

  let { offset, limits, order, sort } = req.query
  offset = Number(offset)
  limits = Number(limits)
  order = Number(order) 

  const r = {
    items: [],
    totalCount: 0
  }

  const t = await userDAO.find().sort({email: order}).limit(limits).skip(offset)
  r.totalCount = t.length
  r.items = t
  
  res.json(r)
}

module.exports.user_detail = async (req, res, next) => {
  const { uid } = req.params
  if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
    return res.status(403).json({msg: 'Permission Denied.'})
  }

  let result;
  try {
    result = await userDAO.findById({_id: uid})
    if (!result) {
      return res.status(404).json({msg: 'user not found.'})
    }
  } catch (err) {
    return next(err)
  }
  return res.json({msg: 'user found.', data: result});
}

module.exports.user_modify = async (req, res, next) => {
  const { uid } = req.params
  const { password, name, role } = req.body

  // only admin can change the role
  if (req.user.role !== 'admin' && role) {
    return res.status(403).end();
  }

  try {
    const user = await userDAO.findById(uid);
    if (!user) return res.status(404).json({msg: "user not found."});

    if (password) user.password = password;
    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();
    return res.json({msg: 'user updated'})

  } catch (err) {
    next(err)
  }
}

module.exports.user_delete = async (req, res, next) => {
  const { uid } = req.params

  if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
    return res.status(403).json({msg: 'Permission Denied.'})
  }

  try {
    const user = await userDAO.findByIdAndDelete(uid);
    if (!user) return res.status(404).json({msg: "user not found."});

  } catch (err) {
    return next(err)
  }
  return res.status(204).end();
}