// Call User model
let userDAO = require("../models/user");

module.exports.users_list = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Permission Denied.'
    })
  }

  let { offset, limits, order } = req.query
  offset = Number(offset)
  limits = Number(limits)

  const r = {
    items: [],
    totalCount: 0
  }
  const total = await userDAO.countDocuments()
  let t = await userDAO.find().sort(order).limit(limits).skip(offset)
  t = t.map(x => x._doc).map(({ password, ...rest }) => rest)   // remove password data
  r.totalCount = total
  r.items = t
  res.json(r)
}

module.exports.user_me = async (req, res, next) => {
  let result;
  try {
    result = await userDAO.findById({_id: req.user._id})
    if (!result) {
      return res.status(404).json({msg: 'user not found.'})
    }
  } catch (err) {
    return next(err)
  }
  const {password, ...rest} = result._doc   // remove password
  return res.json({message: 'user found.', user: rest });
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
  const {password, ...rest} = result._doc   // remove password
  return res.json({message: 'user found.', user: result });
}

module.exports.user_modify = async (req, res, next) => {
  const { uid } = req.params
  const { password, name, role, gpus, activated } = req.body

  // only admin can change the role and gpus
  if (req.user.role !== 'admin' && ( role || gpus )) {
    return res.status(403).end();
  }

  try {
    const user = await userDAO.findById(uid);
    if (!user) return res.status(404).json({msg: "user not found."});

    if (password) user.password = password;
    if (name) user.name = name;
    if (role) user.role = role;
    if (gpus) user.gpus = gpus;
    if (activated) user.activated = activated;

    await user.save();
    return res.json({message: 'user updated'})

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