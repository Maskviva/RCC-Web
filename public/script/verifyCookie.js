const host = window.location.host;
const url = `http://${host}/`;

function verifyCookie() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url + 'userInfo',
            type: 'POST',
            success: function (data) {
                if (data.success) {
                    resolve(data);
                } else {
                    reject(false);
                }
            }
        })
    })
}

function logout() {
    $.ajax({
        url: url + 'logout',
        type: 'POST',
        success: function (response) {
            alert(response.message);
            if (response.success) {
                location.reload(true);
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
