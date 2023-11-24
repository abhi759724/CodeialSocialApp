{
  // method to submit the form data for new post using AJAX
  let createPost = function () {
    let newPostform = $("#new-post-form");
    newPostform.submit(function (e) {
      e.preventDefault();

      $.ajax({
        type: "post",
        url: "/posts/create",
        data: newPostform.serialize(),
        success: function (data) {
          let newPost = newPostDom(data.data.post);
          $("#posts-list-container>ul").prepend(newPost);
          deletePost($(" .delete-post-button", newPost));

          // call the create comment class
          new PostComments(data.data.post._id);

          new ToggleLike($(" .toggle-like-button", newPost));

          new Noty({
            theme: "relax",
            text: "Post published !!!",
            type: "success",
            layout: "topRight",
            timeout: 1500,
          }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };
  // method to create a post in DOM
  let newPostDom = function (post) {
    // let Time = new PostCommentTime(post.createdAt);
    // let postTime = Time.getTimeAgo(post.createdAt);
    // console.log(postTime);

    return $(`<li class="each-post" id="post-${post._id}"> 
                    <p class="each-post-text">
                            <small class="small-delete">
                                <a class="delete-post-button" href="/posts/destroy/${post._id}">X</a> 
                            </small>
                
                        <div class="post-user">
                                <div><img src="${post.user.avatar}" alt="${post.user.name}" width="100"></div>
                            
                            <span>
                                <p class="post-user-name"> ${post.user.name} </p>
                                <p class="post-timing">${post.createdAt}</p>
                            </span>
                        </div>
                        
                        <p class="post-content">${post.content}</p>
                        
                        <small>
                            
                                <a class="toggle-like-button" data-likes="${post.likes.length}" href="/likes/toggle/?id=${post._id}&type=Post">
                                    <i class="fa-regular fa-heart"></i> ${post.likes.length}
                                </a>
                
                        </small>
                    </p>
                    <div class="post-comments">
                            <form action="/comments/create" method="POST" class="comment-form" id="post-${post._id}-comments-form" >
                                <input type="text" name="content" placeholder="Type Here to add comment..." required />
                                <input type="hidden" name="post" value="${post._id}" />
                                <input type="submit" value="Add Comment" style="font-weight:bold; background-color: rgba(128, 128, 128, 0.461);"/>
                            </form>
                
                        <div class="post-comments-list">
                            <ul class="flex" id="post-comments-${post._id}">
                                
                            </ul>
                        </div>
                    </div>
                </li>`);
  };

  // method to delete a post from DOM
  let deletePost = function (deleteLink) {
    $(deleteLink).click(function (e) {
      e.preventDefault();

      $.ajax({
        type: "get",
        url: $(deleteLink).prop("href"),
        success: function (data) {
          $(`#post-${data.data.post_id}`).remove();

          new Noty({
            theme: "relax",
            text: "Post Deleted !!!",
            type: "success",
            layout: "topRight",
            timeout: 1500,
          }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };

  // loop over all the existing posts on the page (when the window loads for the first time) and call the delete post method on delete link of each, also add AJAX (using the class we've created) to the delete button of each
  let convertPostsToAjax = function () {
    $("#posts-list-container>ul>li").each(function () {
      let self = $(this);
      let deleteButton = $(" .delete-post-button", self);
      deletePost(deleteButton);

      // get the post's id by splitting the id attribute
      let postId = self.prop("id").split("-")[1];
      new PostComments(postId);
    });
  };

  createPost();
  convertPostsToAjax();
}
