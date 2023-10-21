const fs = require('fs')
const path = require('path')
const moment = require('moment')

module.exports = {
  camelize(str) {
    // converting all characters to lowercase
    const ans = str.toLowerCase()
    // Returning string to camelcase
    return ans
      .split(' ')
      .reduce((s, c) => s + (c.charAt(0).toUpperCase() + c.slice(1)))
  },

  getCurrentTime() {
    const datetime = Date.now()
    const currentTime = new Date().getTime()
    const durationInMilisecond = Math.floor(19800 * 1000)
    const date = moment(datetime + durationInMilisecond).format('YYYY-MM-DD')
    const parseDate = Date.parse(date)
    const parseTime = currentTime + durationInMilisecond // Date.parse(time);
    return { parseDate, parseTime }
  },

  async dateToString(date) {
    const datetime = new Date(date)
    const stringDate = moment(datetime.toISOString().slice(0, 10)).unix()
    return stringDate
  },

  fileUploads(files, dirName) {
    return new Promise((resolve) => {
      const fileUploads = []

      const dirPath = `${global.uploadDir}/${dirName}`
      if (!fs.existsSync(global.uploadDir)) {
        fs.mkdirSync(global.uploadDir)
      }
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }

      for (const file in files) {
        const time = new Date().getTime()
        const extension = path.extname(files[file].name)
        const renameFile = `${time}${extension}`
        fileUploads.push(
          // eslint-disable-next-line no-shadow
          new Promise((resolve, reject) => {
            files[file].mv(`${dirPath}/${renameFile}`, (error) => {
              if (error) {
                reject({ key: file, value: 'Error' })
              }
              resolve({ key: file, value: renameFile })
            })
          })
        )
      }
      const uploadRes = new Map()
      Promise.allSettled(fileUploads).then((res) => {
        res.forEach((item) => {
          item.status === 'fulfilled'
            ? uploadRes.set(item.value.key, item.value.value)
            : uploadRes.set('error', item.reason.value)
        })
        resolve(uploadRes)
      })
    })
  },

  unlinkFile(filePath = []) {
    try {
      filePath.forEach((item) => {
        if (fs.existsSync(item)) {
          fs.unlinkSync(item)
        }
      })
    } catch (error) {
      throw error
    }
  }
}
