import {base_url, back_base_url} from "./module.js";
import {get_logged_uid, removeCookie} from "./util.js";


const page_size = 12
const movie_by_kw = function (kw) {
    return `
    query{
  movieBykw(kw: "${kw}"){
    title
    adult
    budget
    genres{name}
    language
    popularity
    release_date
    revenue
    runtime
    status
    img_path
    mid
  }
}
    `
}

const movie_by_genre = function (g) {
    return `query{
  genre(name:"${g}", limit:100){
        title
    adult
    budget
    genres{name}
    language
    popularity
    release_date
    revenue
    runtime
    status
    mid
    img_path
  }
}`
}

const sign_in = function (u, p) {
    return `mutation{
  login(password:"${p}", name:"${u}")
}`
}

const get_uid = function (u, p) {
    return `query{
  userByname(
    name: "${u}", pw: "${p}"
  ){
    uid
  }
}`
}

const user_register = function (params) {
    return `mutation{
  userCreate(inputUser: {
    name: "${params.username}",
    password: "${params.password}",
    age: ${params.age},
    Email: "${params.email}",
    address: "${params.address}",
    status: memeber
  }){
    uid
  }
}`
}

const movie_item = function (params) {
    return `
                 <div class="col movie_item" type="button" id="${params.mid}">
                    <div class="card shadow-sm">
                        <img src=${params.img_path.substring(12, params.img_path.length - 3) + "jpg"} alt="img">

                        <div class="card-body">
                            <p class="card-text">${params.title}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    ${get_genres(params.genres)}
                                </div>
                                <small class="text-muted">${params.runtime} mins</small>
                            </div>
                        </div>
                    </div>
                </div>
    `
}

const get_genres = function (genres) {

    if (genres.length > 3) {
        genres.length = 3
    }
    var res = ""
    genres.forEach(item => res = res + (`<button  class="btn btn-sm btn-outline-secondary">${item.name}</button>`))
    return res
}


function onLogin() {

    if (get_logged_uid() !== undefined) {
        $('#personal_list').html(`
    <li><a href="/person" class="text-white">Update profile</a></li>
    <li><a href="/person" class="text-white">Manage rates and comments</a></li>
    <li><a href="#" class="text-white" id="log_out">Log out</a></li>
    `)

        $("#btn_reg_log").html("")

        $('#log_out').click(function () {

            axios({
                method: "POST",
                url: back_base_url,
                data: {
                    query: `mutation{logout}`
                }
            }).then((response) => {
                removeCookie("logged_uid")
                window.location.reload()
            })
        })
    }


}

function get_page_index(num) {
    var h = `<li class="page-item"><a class="page-link active">1</a></li>`

    for (let i = 0; i < num-1; i++) {
        h += `<li class="page-item"><a class="page-link">${i + 2}</a></li>`
    }
    return h
}

function set_movie_list(data) {

    var movie_html = "";

    data.forEach(para => {
        movie_html = movie_html + movie_item(para)
    })

    $('#movie_list').html(movie_html)

    $(".movie_item").click(function () {
        window.open(`${base_url}/movie/${this.id}`)
    })
}

function search_by(query, kw, index) {


    axios({
        method: "POST",
        url: back_base_url,
        data: {
            query: query(kw)
        }
    }).then((response) => {

        var res = response.data.data[index]

        if (res !== undefined && res.length !== 0) {

            var page_num = Math.ceil(res.length / page_size)
            var page_i = get_page_index(page_num)

            $('#page_index').html(page_i)
            $(".page-link").click(function () {

                var page_index_i = parseInt($(this).text()) - 1
                console.log(page_index_i)
                $(".page-link").removeClass("active")
                $(this).addClass("active")
                set_movie_list(res.slice(page_index_i*page_size, (page_index_i+1)*page_size))
            })
            set_movie_list(res.slice(0, page_size))

        } else {
            $('#movie_list').html(`<p class="text-muted">No records for this search.</p>`)
            $('#page_index').html(" ")
        }


    })
}


$(function () {

    onLogin()
    search_by(movie_by_kw, ".", "movieBykw")

    $('#sign_in_').click(function () {
        const uname = $('#input_username').val()
        const pwd = $('#input_password').val()
        axios({
            method: "POST",
            url: back_base_url,
            data: {
                query: sign_in(uname, pwd)
            }
        }).then((response) => {
            if (response.data.data.login) {

                axios({
                    method: "POST",
                    url: back_base_url,
                    data: {
                        query: get_uid(uname, pwd)
                    }
                }).then((res_uid) => {
                    const logged_uid = res_uid.data.data.userByname.uid
                    document.cookie = `logged_uid=${logged_uid}`
                    console.log(document.cookie)
                    $("#modal_close").click()
                    onLogin()

                    alert("Sign in successfully!")
                })


            } else {

                alert("Username and password do not match!")
            }
        })

    })

    $('#register_').click(function () {
        const reg_form = {
            username: $("#reg_username").val(),
            password: $("#reg_password").val(),
            email: $("#reg_email").val(),
            age: $("#reg_age").val(),
            address: $("#reg_address").val()
        }

        axios({
            method: "POST",
            url: back_base_url,
            data: {
                query: user_register(reg_form)
            }
        }).then((response) => {
            if (response.data.data.userCreate != null) {
                alert('Register successfully!')
                $("#modal_reg_close").click()
                $("#btn_log_in").click()
            } else {
                alert("You may log out before register a new account.")
            }

        })


    })

    $("#btn_search").click(function () {

        const search_words = $('#search_words').val()
        const search_option = $('#search_by').val()


        if (search_option === '1') {
            search_by(movie_by_kw, search_words, "movieBykw")
        } else if (search_option === '2') {
            search_by(movie_by_genre, search_words, "genre")
        }


    })


})

