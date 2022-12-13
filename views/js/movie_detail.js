import {base_url, back_base_url} from "./module.js";
import {get_logged_uid, removeCookie} from "./util.js";


var username_by_id = function (uid) {
    return `query{
  userById(uid:"${uid}"){
    name
  }
}`
}
var movie_by_id = function (mid) {
    return `query{
  movieById(mid: "${mid}"){
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
    overview
    tagline
  }
}`
}

var comments_by_movie = function (mid) {
    return `query{
  comment(mid: "${mid}"){
    cid
    userId
    commentText
  }
}`
}

const rate_by_id = function (uid, mid) {
    return `query{
  rate(uid:"${uid}", mid: "${mid}"){
    rate
  }
}`

}
const create_comment = function (mid, comment) {
    return `mutation{
  CommentCreate(inputComment: {
    movieId: "${mid}",
    userId: "${get_logged_uid()}",
    commentText: "${comment}"
  }){
    cid
  }
}`
}

const create_rate = function (mid, rate) {
    return `mutation{
  RateCreate(inputRate: {
    movieId:"${mid}",
    userId: "${get_logged_uid()}",
    rate: ${rate}
  }){
    rid
  }
}
`
}

async function get_username(uid) {

    if (uid === null || uid === undefined) {
        return "N/A"
    }

    const res = await axios.post(back_base_url, {
        query: username_by_id(uid)
    })

    console.log(res.data.data.userById.name)
    return res.data.data.userById.name

}

async function get_rate(uid, mid) {

    if (uid === null || uid === undefined) {
        return "N/A"
    }
    const res = await axios.post(back_base_url, {
        query: rate_by_id(uid, mid)
    })

    const r = res.data.data.rate
    if (r == null || r.length === 0) {
        return "N/A"
    } else {
        return r[0].rate
    }

}


var get_comment_item = async function (params, mid) {

    return `        <div class="d-flex text-muted pt-3">
            <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32"
                 xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32"
                 preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title>
                <rect width="100%" height="100%" fill="#6f42c1"/>
            </svg>

            <div class="mb-0  lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                    <strong class="text-gray-dark">@${await get_username(params.userId)}</strong>
                </div>
                <span class="d-block pb-1">Rate: ${await get_rate(params.userId, mid)}</span>
                <p class="small" style="text-align:justify; margin-right: 20px">
                    ${params.commentText}
                </p>
            </div>
        </div>`
}


const get_genres = function (genres) {
    var res = ""
    genres.forEach(item => res = res + (`<button  class="btn btn-sm btn-outline-secondary">${item.name}</button>`))
    return res
}

const get_info = function (params) {
    return ` <strong class="d-inline-block mb-2 text-success">Information</strong>
                    <p>
                        Release Date: ${params.release_date}<br>
                        Time: ${params.runtime} mins<br>
                        Language: ${params.language}<br>
                        Budget: ${Math.round(params.budget / 1000)}K<br>
                        Revenue: ${Math.round(params.revenue / 1000)}K
                    </p>`
}


$(function () {

    const movie_id = $('#movie_id').attr("content")

    axios({
        method: "POST",
        url: back_base_url,
        data: {
            query: movie_by_id(movie_id)
        }
    }).then((response) => {

        var res = response.data.data.movieById

        $('#name_').text(res.title)
        $('#tagline_').text(res.tagline)
        $('#genre_').html(get_genres(res.genres))

        $('#overview_').text(res.overview + " " + res.overview)
        $('#info_').html(get_info(res))
        $("#movie_img_").attr('src', res.img_path.substring(12, res.img_path.length - 3) + "jpg")

    })

    axios({
        method: "POST",
        url: back_base_url,
        data: {
            query: comments_by_movie(movie_id)
        }
    }).then(async (response) => {

            var params = response.data.data.comment

            if (params !== undefined && params.length !== 0) {
                var comments_html = ""
                for (const item of params) {
                    comments_html += await get_comment_item(item, movie_id)
                }

                $('#comments_holder').html(comments_html)
            }


        }
    )

    $("#comment_submit").click(function () {
        var rate = $("#in_rating").val()
        var comment = $("#in_comments").val()
	if (get_logged_uid() === undefined) {
            alert('Only logged in users can post comments!')
            $("#comment_close").click()
	    return
        }

        axios({
            method: "POST",
            url: back_base_url,
            data: {
                query: create_comment(movie_id, comment)
            }
        }).then((response) => {

            if (response.data.data.CommentCreate != null) {
                axios({
                    method: "POST",
                    url: back_base_url,
                    data: {
                        query: create_rate(movie_id, rate)
                    }
                }).then((response) => {

                    if (response.data.data.RateCreate != null) {
                        alert('Submit successfully!')
                        $("#comment_close").click()
                        window.location.reload();
                    }
                })
            } else {
                alert('Only logged in users can post comments!')
                $("#comment_close").click()
            }

        })


    })


})
