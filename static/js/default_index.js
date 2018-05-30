// This is the js for the default/index.html view.


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        // We want to read the image file, and transform it into a data URL.
        var reader = new FileReader();

        // We add a listener for the load event of the file reader.
        // The listener is called when loading terminates.
        // Once loading (the reader.readAsDataURL) terminates, we have
        // the data URL available. 
        reader.addEventListener("load", function () {
            // An image can be represented as a data URL.
            // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
            // Here, we set the data URL of the image contained in the file to an image in the
            // HTML, causing the display of the file image.
            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            // Reads the file as a data URL.
            reader.readAsDataURL(file);
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.add_image(get_url);
    };



    self.add_image = function(get_url){
        $.post(add_image_url,
            {
            image_url: get_url,
            },
            function(data){
                console.log(get_url)
                self.vue.get_user_images(self.vue.auth_id);
            }
        )
        // console.log(get_url);
        
    };
    
    self.get_users = function(){
        //This function only ever called on page load
        $.getJSON(get_users_url,
            function(data) {
                self.vue.userlist = data.userlist;
                self.vue.auth_id = data.auth_id;
                enumerate(self.vue.userlist);
                self.get_user_images(self.vue.auth_id);
            });
    };
    
    self.get_user_images = function(user_id){
        self.vue.add_image_pending = true;
        self.vue.self_page = false;
        if (self.vue.auth_id == user_id){
            self.vue.self_page = true;
        }
        self.vue.last_selection = user_id;
        self.vue.end_idx = self.vue.get_more_multiple;
        $.post(user_images_url,
        {
            user_id: user_id,
            start_idx: 0,
            end_idx: self.vue.get_more_multiple
        },
        function(data){
            self.vue.imagelist = data.imagelist;
            self.vue.has_more = data.has_more;
            enumerate(self.vue.imagelist);
            self.vue.add_image_pending = false;
            
        }
        );
    };
    
    self.get_more = function(){
        user_id = self.vue.last_selection;
        self.vue.add_image_pending = true;
        self.vue.end_idx = self.vue.end_idx + self.vue.get_more_multiple;
        $.post(user_images_url,
        {
            user_id: user_id,
            start_idx: 0,
            end_idx: self.vue.end_idx,
        },
        function(data){
            self.extend(self.vue.imagelist, data.imagelist);
            self.vue.has_more = data.has_more;
            enumerate(self.vue.imagelist);
            self.vue.add_image_pending = false;
        }
        );
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            img_url: null,
            userlist: [],
            imagelist: [],
            has_more: false,
            last_selection: null,
            add_image_pending: true,
            self_page: true,
            auth_id: -1,
            get_more_multiple: 20,
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            add_image: self.add_image,
            get_users: self.get_users,
            get_user_images: self.get_user_images,
            get_more: self.get_more,
        }

    });

    self.get_users();
    $("#vue-div").show();
    
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

