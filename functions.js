const success = (result) => {
    return {
        status: 'success',
        result: result
    }
}

const error = (message) => {
    return {
        status : 'error',
        result: message
    }
}

exports.success = success
exports.error = error