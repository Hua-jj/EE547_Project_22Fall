import {base_url, back_base_url} from "./module.js";
import {get_logged_uid, removeCookie} from "./util.js";


const get_user = function (u) {
    return `query{
  userById(uid: "${u}"){
    name
    Email
    address
    password
    age
  }
}`
}

const update_user = function (paras) {
    return `mutation{
  userUpdate(uid:"${paras.uid}", inputUser: {
    name: "${paras.name}",
    password: "${paras.password}",
    age: ${paras.age},
    Email: "${paras.email}",
    address: "${paras.address}",
  }){
    uid
  }
}`
}

var comments_by_user = function (uid) {
    return `query{
  comment(uid: "${uid}"){
    cid
    movieId
    commentText
  }
}`
}

const rate_by_id = function (uid, mid) {
    return `query{
  rate(uid:"${uid}", mid: "${mid}"){
    rate
    rid
  }
}`
}

const update_rate = function (rid, rate) {
    return `
    mutation{
  RateUpdate(rid: "${rid}", rate: ${rate}){
    rid
  }
}`
}

async function get_rate(uid, mid) {

    const res = await axios.post(back_base_url, {
        query: rate_by_id(uid, mid)
    })

    const r = res.data.data.rate
    if (r == null || r.length === 0) {
        return {
            rate: "N/A",
            rid: "N/A"
        }
    } else {
        return {
            rate: r[0].rate,
            rid: r[0].rid
        }
    }

}


async function get_comment_item(params, uid) {

    var rate_info = await get_rate(uid, params.movieId)

    return `                            <div class="d-flex text-muted pt-3">
                                <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32"
                                     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32"
                                     preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title>
                                    <rect width="100%" height="100%" fill="#6f42c1"></rect>
                                </svg>

                                <div class="mb-0 lh-sm border-bottom w-100">
                                    <div class="d-flex justify-content-between">
                                        <strong class="text-gray-dark">@${params.name}</strong>
                                        <a href="#" class="btn_edit_comment" data-toggle="modal" data-target="#update_comments_modal">Edit</a>
                                    </div>
                                    <span class="d-block" id="${rate_info.rid}">Rate:&nbsp ${rate_info.rate}</span>
                                    <p class="small" style="text-align:justify; margin-right: 20px" id="${params.cid}">
                                        ${params.commentText}
                                    </p>
                                </div>
                            </div>`
}

$(function () {

    const uid = get_logged_uid()
    if (uid === undefined) {
        alert("you have not logged in.")
        // window.location.replace(base_url+"/home")
        return
    }


    axios({
        method: "POST",
        url: back_base_url,
        data: {
            query: get_user(uid)
        }
    }).then((response) => {

        var user_info = response.data.data.userById

        $("#per_username").attr('value', user_info.name)
        $('#per_address').attr('value', user_info.address)
        $('#per_email').attr('value', user_info.Email)
        $('#per_password').attr('value', user_info.password)
        $('#per_age').attr('value', user_info.age)


        axios({
            method: "POST",
            url: back_base_url,
            data: {
                query: comments_by_user(uid)
            }
        }).then(async (response) => {

            var params = response.data.data.comment


            if (params != null && params.length !== 0) {

                var comments_html = ""
                for (const item of params) {
                    item.name = user_info.name
                    comments_html += await get_comment_item(item, uid)
                }

                $('#comments_holder').html(comments_html)

                $('.btn_edit_comment').click(function () {

                    const ele = $(this).parent().parent()

                    const rid = ele.children("span").attr('id')
                    const cid = ele.children("p").attr('id')

                    console.log(ele.children("p").text())


                    $('#in_comments').val(ele.children("p").text().trim())

                    $("#comment_submit").click(function () {
                        console.log(rid)
                        console.log(cid)

                        axios({
                            method: "POST",
                            url: back_base_url,
                            data: {
                                query: update_rate(rid, $("#in_rating").val())
                            }
                        }).then(async (response) => {
                            if (response.data.data.RateUpdate !== null) {
                                alert('Edit successfully.')
                                $("#comment_close").click()
                                window.location.reload()
                            }
                        })


                    })

                })

            }

        })


    })

    $('#edit_info').click(function () {
        $('.form-control').removeAttr("readonly")
    })

    $('#update_info').click(function () {

        const update_form = {
            uid: uid,
            name: $("#per_username").val(),
            password: $("#per_password").val(),
            email: $("#per_email").val(),
            age: $("#per_age").val(),
            address: $("#per_address").val()
        }
        axios({
            method: "POST",
            url: back_base_url,
            data: {
                query: update_user(update_form)
            }
        }).then((response) => {
            if (response.data.data.userUpdate !== undefined) {
                alert('Update successfully!')
                window.location.reload()
            }
        })
    })


})