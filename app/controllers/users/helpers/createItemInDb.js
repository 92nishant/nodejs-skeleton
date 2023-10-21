const uuid = require('uuid')
const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')
const { fileUploads } = require('../../../middleware/utils/commonUtils')

/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItemInDb = (
  { name = '', email = '', dob = '', country = '' },
  files
) => {
  return new Promise(async (resolve, reject) => {
    const user = new User({
      name,
      email,
      dob,
      country,
      verification: uuid.v4()
    })
    user.save(async (err, item) => {
      if (err) {
        reject(buildErrObject(422, err.message))
      }

      item = JSON.parse(JSON.stringify(item))

      const result = await fileUploads(files, item._id)
      // result.forEach((value, key) => {
      //   if (key !== 'error') {
      //     filesData[key] = value
      //   }
      // })
      console.log(result.get('image'))
      await User.findByIdAndUpdate(item._id, { image: result.get('image') })
      delete item.blockExpires
      delete item.loginAttempts

      resolve(item)
    })
  })
}

module.exports = { createItemInDb }
