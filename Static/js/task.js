const system_url = '/api/system-info';
const active_url = '/api/active-info';
const config_url = '/api/config';
const app_status_url = '/api/app-status' + window.location.search;

let system_info = {};
let active_info = {};
let config_info = {};
let app_status_info = {};


run = function run() {
    console.log("===== start =====");
    initDragbox();
    before()
};

run();

function before() {
    console.log("===== before =====");
    const ajaxPromise = (url) => {
        return new Promise((resolve) => {
            axios.get(url)
                .then(function (response) {
                    let res = response.data.data;
                    resolve(res);
                }).catch((err) => {
                console.error(err);
            })
        })
    };

    let system_get = ajaxPromise(system_url).then(data => {
        system_info = data
    });
    let active_get = ajaxPromise(active_url).then(data => {
        active_info = data
    });
    let config_get = ajaxPromise(config_url).then(data => {
        config_info = data
    });
    let app_status_get = ajaxPromise(app_status_url).then(data => {
        app_status_info = data
    });
    Promise.all([
        system_get,
        active_get,
        config_get,
        app_status_get])
        .then(() => {
            main()
        });
}

function main() {
    console.log("===== main =====");
    console.log(system_info);
    console.log(active_info);
    console.log(config_info);
    console.log(app_status_info);

    initTitle();

    changePage("overview")
}

function initTitle() {
    document.getElementById("head-title").innerHTML = app_status_info.name
}

function changePage(name) {
    let mount = document.getElementById("mount");
    if (name === "overview") {
        mount.innerHTML = overviewPage()
    } else if (name === "config") {
        configPage()
    } else if (name === "logger") {
        loggerPage()
    } else {
        console.error(name)
    }
}


function goMenu() {
    window.location = "/menu.html"
}

function goBack() {
    window.location = "/"
}

function goDelete() {
    Swal.fire({
        title: '????????????' + app_status_info.name + "???",
        text: "?????????????????????",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgba(84, 58, 183, 0.5)',
        cancelButtonColor: 'rgba(0, 172, 193, 0.5)',
        confirmButtonText: '??????!'
    }).then((result) => {
        if (result.value === true) {
            deleteApp(app_status_info.name)
        }
    })
}

function taskPage(event) {
    let elem = event.path[0];
    let name = elem.name;
    let selected = document.getElementsByClassName("model-button-selected")[0];
    selected.setAttribute("class", "model-button-item");
    elem.setAttribute("class", "model-button-item model-button-selected");
    changePage(name)
}

function deleteApp(name) {
    console.log(name);
    let url = '/api/app-delete?name=' + app_status_info.name;
    axios.get(url)
        .then(function (response) {
            let res = response.data.data;
            Swal.fire(
                '????????????',
                app_status_info.name + '????????????',
                res
            ).then((result) => {
                if (result.value === true) {
                    window.location = "/"
                }
            });

        }).catch((err) => {
        console.error(err);
    })
}

function initDragbox() {
  dragbox.scrollLeft = 50;
  dragbox.scrollTop = 150;
}



// config ***************************************

function configPage() {
    let mount = document.getElementById("mount")
    var url = "/api/app-config?name=" + app_status_info.name;
    let HTML = ""
    new Promise((resolve) => {
        axios.get(url)
            .then(function (response) {
                let res = response.data.data
                resolve(res);
            }).catch((err) => {
            console.error(err);
        })
    }).then((res) => {
        let params = res;
        for (let model in params) {
            HTML += `
            <div class="glass-card">
                <br>
                <p class="glass-title">${model}</p>
                <hr class="glass-hr">
                ${itemHTMLMake(params[model])}
                <br>
            </div>`
        }

        function itemHTMLMake(model) {
            let html = ""
            for (let item in model) {
                html += `<p class="glass-content">${item}: ${model[item]}</p>`
            }
            return html
        }

        mount.innerHTML = HTML
    })
}


// overview *************************************

function overviewPage() {
    let HTML = ""
    if (app_status_info.status === true) {
        HTML = template_active()
    } else {
        HTML = template_stopped()
    }
    return HTML
}

function template_active() {
    param = app_status_info

    let threads = ""
    let environ = ""
    let open_files = ""

    if (param.process.threads) {
        param.process.threads.forEach((thread) => {
            threads += `
                <div class="row-item">
                    <p class="glass-content">${thread[0]}</p>
                    <p class="glass-content">${thread[1]}</p>
                    <p class="glass-content">${thread[2]}</p>
                </div>`
        })
    }

    for (item in param.process.environ) {
        environ += `
            <div class="row-item">
                <p class="glass-content environ long-text">${item}</p>
                <p class="glass-content">:</p>
                <p class="glass-content environ long-text">"${param.process.environ[item]}"</p>
            </div>`
    }

    param.process.open_files.forEach((file) => {
        open_files += `
            <p class="glass-content long-text open-file">${file[0]}</p>`
    })

    return `
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <p class="glass-content">??????: ${param.name}</p>
        <p class="glass-content">PID: ${param.pid}</p>
        <p class="glass-content">??????: ${param.process.terminal}</p>
        <p class="glass-content">??????: ${param.process.status}</p>
        <p class="glass-content">??????: ${param.process.username}</p>
        <p class="glass-content">????????????: ${param.time}</p>
        <p class="glass-content">?????????: ${config_info.Server.server_name + '-' + config_info.Server.server_version}</p>
        <p class="glass-content">??????: ${system_info.platform}</p>
        <p class="glass-content">??????: ${system_info.machine}</p>
        <p class="glass-content">??????: ${system_info.version}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <p class="glass-content long-text">????????????: ${param.process.exe}</p>
        <p class="glass-content long-text">????????????: ${param.path + '/' + param.launch_params.main}</p>
        <p class="glass-content long-text">????????????: ${param.launch_params.args}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">CPU??????</p>
        <hr class="glass-hr">
        <p class="glass-content">?????????: ${param.process.cpu_percent}</p>
        <p class="glass-content">?????????: ${active_info.cpu_count}</p>
        <p class="glass-content">????????????: ${param.process.cpu_times[0]}</p>
        <p class="glass-content">????????????: ${param.process.cpu_times[1]}</p>
        <p class="glass-content">?????????: ${param.process.cpu_times[2]}</p>
        <p class="glass-content">?????????: ${param.process.cpu_times[3]}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <p class="glass-content">?????????: ${param.process.memory_percent}</p>
        <p class="glass-content">????????????: ${param.process.memory_info[0]}</p>
        <p class="glass-content">????????????: ${param.process.memory_info[1]}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">??????</p>
        <hr class="glass-hr">
        <p class="glass-content">?????????: ${active_info.cpu_count}</p>
        <p class="glass-content">?????????: ${param.process.num_children}</p>
        <p class="glass-content">?????????: ${param.process.num_threads}</p>
        <p class="glass-content"></p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">??????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">ID</p>
                <p class="glass-content">????????????</p>
                <p class="glass-content">????????????</p>
            </div>
            ${threads}
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">?????????</p>
                <p class="glass-content">-</p>
                <p class="glass-content">?????????</p>
            </div>
            ${environ}
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">???????????????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                ${open_files}
            </div>
        </div>
        <br>
    </div>
    `
}

function template_stopped() {
    param = app_status_info
    return `
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <p class="glass-content">??????: ${param.name}</p>
        <p class="glass-content">?????????: ${config_info.Server.server_name + '-' + config_info.Server.server_version}</p>
        <p class="glass-content">??????: ${system_info.platform}</p>
        <p class="glass-content">??????: ${system_info.machine}</p>
        <p class="glass-content">??????: ${system_info.version}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <p class="glass-content long-text">????????????: ${param.path + '/' + param.launch_params.main}</p>
        <p class="glass-content long-text">????????????: ${param.launch_params.args}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">CPU??????</p>
        <hr class="glass-hr">
        <p class="glass-content">?????????: ${active_info.cpu_count}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">??????</p>
        <hr class="glass-hr">
        <p class="glass-content">?????????: ${active_info.cpu_count}</p>
        <p class="glass-content"></p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">??????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">ID</p>
                <p class="glass-content">????????????</p>
                <p class="glass-content">????????????</p>
            </div>
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">????????????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">?????????</p>
                <p class="glass-content">-</p>
                <p class="glass-content">?????????</p>
            </div>
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">???????????????</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
            </div>
        </div>
        <br>
    </div>
    `
}

// logger ***************************************

function loggerPage() {
    var url = "/api/app-logger?name=" + app_status_info.name;
    var content = "";

    const ajax = new Promise(function (resolve, reject) {
        axios
            .get(url)
            .then(function (response) {
                content = response.data.data;
                resolve(content);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
    }).then(function (content) {
        console.log(content);
        let info = content.split("\n");

        const log_container = document.createElement("div");
        log_container.setAttribute("class", "log-contaniner");
        // for (let i = 0; i < 100; i++) {
        //   const item = document.createElement('div');
        //     item.id = 'item';
        //     log_container.appendChild(item);
        // }
        info.reverse(); // ????????????
        info.forEach((value, index, array) => {
            let time = value.substring(0, 21);
            let module = value.substring(21).split(":")[0];
            let content = value.substring(21 + module.length);

            let glass_item_list = document.createElement('div');
            glass_item_list.className = 'glass-item-list';

            let item_time = document.createElement('p');
            item_time.className = 'glass-item item-time';
            item_time.innerHTML = time;
            glass_item_list.appendChild(item_time);

            let item_module = document.createElement('span');
            item_module.className = 'glass-item item-module';
            item_module.innerHTML = module;
            glass_item_list.appendChild(item_module);

            let item_content = document.createElement('span');
            item_content.className = 'glass-item item-content';
            item_content.innerHTML = content;
            glass_item_list.appendChild(item_content);

            log_container.appendChild(glass_item_list);
        })
        let mount = document.getElementById("mount")
        mount.innerHTML = ""
        mount.appendChild(log_container)
    });
}

// const system_url = 'http://127.0.0.1:12000/api/system-info'
// const active_url = 'http://127.0.0.1:12000/api/active-info'
// const config_url = 'http://127.0.0.1:12000/api/config'
// const app_status_url = 'http://127.0.0.1:12000/api/app-status' + window.location.search
// const system_url = 'http://127.0.0.1:12000/api/system-info'
// const active_url = 'http://127.0.0.1:12000/api/active-info'
// const config_url = 'http://127.0.0.1:12000/api/config'
// const app_status_url = 'http://127.0.0.1:12000/api/app-status' + window.location.search
