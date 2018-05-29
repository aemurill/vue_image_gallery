import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.
@auth.requires_login()
@auth.requires_signature()
def add_image():
    print('adding image')
    image_id = db.user_images.insert(
        image_url = request.vars.image_url,
    )
    print('image added')
    # image = db.user_images(image_id)
    # print(image)
    return
    
@auth.requires_login()
@auth.requires_signature()
def get_user_images():
    user_id = request.vars.user_id
    print('getting user images')
    imagelist = []
    rows = db(db.user_images.created_by == user_id).select()
    for r in rows:
        t = dict(
            id = r.id,
            created_on = r.created_on,
            created_by = r.created_by,
            image_url = r.image_url,
        )
        print(t)
        imagelist.append(t)
    
    return response.json(dict(
        imagelist = imagelist,
    ))

@auth.requires_login()
@auth.requires_signature()
def get_users():
    userlist = [];
    row = db(db.auth_user.id == auth.user.id).select()
    for r in row:
        t = dict(
            first_name = r.first_name,
            last_name = r.last_name,
            email = r.email,
            id = r.id,
        )
    userlist.append(t)
    rows = db(db.auth_user.id != auth.user.id).select()
    for r in rows:
        # print(r.first_name)
        t = dict(
            first_name = r.first_name,
            last_name = r.last_name,
            email = r.email,
            id = r.id,
        )
        userlist.append(t)
    print(userlist)
    return response.json(dict(
        userlist = userlist,
    ))
    