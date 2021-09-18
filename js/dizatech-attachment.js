// Config and Headers
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

// Plugins
window.Swal = require('sweetalert2');

window.alertify = require('alertifyjs/build/alertify.min');

require('lity/dist/lity.min');

require("jquery-ui/ui/core");
require("jquery-ui/ui/widget");
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/sortable");

let uniqid = require('uniqid');

// Sort and sort alert
$(".gallery_files").sortable({
    cursor: 'move',
    update: function (event, ui) {
        alertify.success('مرتب‌سازی مجددا انجام شد.');
    }
});
$(".uploaded_files").sortable({
    cursor: 'move',
    update: function (event, ui) {
        alertify.success('مرتب‌سازی مجددا انجام شد.');
    }
});
$(".video_files").sortable({
    cursor: 'move',
    update: function (event, ui) {
        alertify.success('مرتب‌سازی مجددا انجام شد.');
    }
});

// Images
$('.gallery_image_upload').change(function () {

    let target = $(this).closest('.gallery');
    let upload_url = $(this).data('upload');

    if (!$(this).prop('multiple') && target.find('.gallery_file_upload').length > 0) {
        Swal.fire({
            title: 'خطا در بارگذاری فایل',
            text: 'برای آپلود فایل جدید باید ابتدا فایل فعلی را حذف کنید.',
            icon: 'error',
            confirmButtonText: 'تایید',
            customClass: {
                confirmButton: 'btn btn-success',
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animated fadeInDown'
            },
            hideClass: {
                popup: 'animated fadeOutUp'
            }
        });

        $(this).val('');
        return;
    }

    for (let i = 0; i < $(this).prop('files').length; i++) {
        // unique id per file
        let file_id = uniqid();
        // input name
        let input_name = $(this).attr('data-name') + "[]";
        // caption name
        let caption_input_name = $(this).attr('data-name') + '_caption' + "[]";

        // caption div
        let caption_markup = '<div class="file_caption rtl my-1"><div class="row"><div class="col">' +
            '<label>عنوان</label>' +
            '<input type="text" class="form-control" name="' + caption_input_name + '" placeholder="اختیاری">' +
            '</div></div></div>';

        // file div
        let markup = '<div class="gallery_file_upload mb-2" id="' + file_id + '">' +
            '<span class="delete_file"><i class="fa fa-times"></i></span>' +
            '<div class="file_info">' +
            '<a class="uploaded_file_thumbnail" data-lity target="_blank" href="#" style="display: none;"><img src="" alt="img_' + file_id + '"></a>' +
            '<span class="file_name"></span>' +
            '<input class="uploaded_file_path" type="hidden" name="' + input_name + '">' +
            '</div>' +
            '<div class="progress">' +
            '<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>' +
            '</div>' +
            '</div>';

        target.find('.gallery_files').append(markup).sortable();

        // prepare data
        let formData = new FormData();
        formData.append('file', $(this).prop('files')[i]);
        formData.append('file_type', 'image');
        if($(this).closest('.gallery').find('.custom_validation').length) {
            formData.append('validation', $(this).closest('.gallery').find('.custom_validation').val());
        }
        if($(this).closest('.gallery').find('.custom_disk').length) {
            formData.append('disk', $(this).closest('.gallery').find('.custom_disk').val());
        }
        // let fail_message = '<span class="ltr">آپلود فایل ' + $(this).prop('files')[i].name + ' با خطا مواجه شد.</span>';

        // send request
        $.ajax({
            url: upload_url,
            async: true,
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            type: 'post',
            success: function (response) {
                if (response.status == 200) {
                    $('#' + file_id).find('.file_name').text(response.file_name);
                    $('#' + file_id).find('.uploaded_file_path').val(response.file_key);
                    $('#' + file_id).find('.uploaded_file_thumbnail').attr('href', response.file_url).show();
                    $('#' + file_id).find('.uploaded_file_thumbnail img').attr('src', response.thumbnail);
                    $('#' + file_id ).append(caption_markup);
                    $('#' + file_id).find('.progress').remove();
                    alertify.success('بارگذاری با موفقیت انجام شد.');
                }
            },
            error: function (response) {
                $('.gallery_file_upload').filter('#'+file_id).remove();
                if (response.status == 422) {
                    let response_text = $.parseJSON(response.responseText);
                    let text = response_text.errors.file[0];
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status >= 500) {
                    let text = 'در سمت سرور خطایی بوجود آمده است.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 403) {
                    let text = 'شما دسترسی انجام عملیات بارگذاری را ندارید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 401) {
                    let text = 'قبل از انجام درخواست بارگذاری وارد برنامه شوید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                }
            },
            xhr: function () {
                let myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener(
                        'progress',
                        function (e) {
                            progress(e, file_id);
                        },
                        false);
                }
                return myXhr;
            }
        });
    }
    $(this).val('');
});

$('.gallery').on('click', '.delete_file', function () {
    let target = $(this).closest('.gallery_file_upload');
    let remove_url = $(this).closest('.gallery').find('.gallery_image_upload').data('remove');
    let id = target.find('.uploaded_file_path').val();
    let type = 'image';

    Swal.fire({
        title: 'آیا برای حذف اطمینان دارید؟',
        icon: 'warning',
        showCancelButton: true,
        customClass: {
            confirmButton: 'btn btn-danger mx-2',
            cancelButton: 'btn btn-light mx-2'
        },
        buttonsStyling: false,
        confirmButtonText: 'حذف',
        cancelButtonText: 'لغو',
        showClass: {
            popup: 'animated fadeInDown'
        },
        hideClass: {
            popup: 'animated fadeOutUp'
        }
    })
        .then((result) => {
            if (result.isConfirmed) {
                if(id == '') {
                    target.remove();
                    Swal.fire({
                        icon: 'success',
                        text: 'عملیات حذف با موفقیت انجام شد.',
                        confirmButtonText:'تایید',
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        buttonsStyling: false,
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else {
                    Swal.fire({
                        title: 'در حال اجرای درخواست',
                        icon: 'info',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        onOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    $.ajax({
                        type: 'post',
                        url: remove_url,
                        dataType: 'json',
                        data: {
                            object_id: id,
                            object_type: type
                        },
                        success: function (response) {
                            target.remove();
                            Swal.fire({
                                icon: 'success',
                                text: 'عملیات حذف با موفقیت انجام شد.',
                                confirmButtonText:'تایید',
                                customClass: {
                                    confirmButton: 'btn btn-success',
                                },
                                buttonsStyling: false,
                                showClass: {
                                    popup: 'animated fadeInDown'
                                },
                                hideClass: {
                                    popup: 'animated fadeOutUp'
                                }
                            })
                        },
                        error: function(response){
                            if( response.status == 422 ) {
                                let response_text = $.parseJSON( response.responseText );
                                Swal.fire({
                                    icon: 'error',
                                    html: response_text.errors.object_id[0],
                                    confirmButtonText:'تایید',
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    buttonsStyling: false,
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status >= 500) {
                                let text = 'در سمت سرور خطایی بوجود آمده است.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status == 403) {
                                let text = 'شما دسترسی انجام عملیات حذف را ندارید.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
});

// Attachments
$('.attachment_upload').change(function () {

    let target = $(this).closest('.attachments');
    let upload_url = $(this).data('upload');

    if (!$(this).prop('multiple') && target.find('.attachment_file_upload').length > 0) {
        Swal.fire({
            title: 'خطا در بارگذاری فایل',
            text: 'برای آپلود فایل جدید باید ابتدا فایل فعلی را حذف کنید.',
            icon: 'error',
            confirmButtonText: 'تایید',
            customClass: {
                confirmButton: 'btn btn-success',
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animated fadeInDown'
            },
            hideClass: {
                popup: 'animated fadeOutUp'
            }
        });

        $(this).val('');
        return;
    }

    for (let i = 0; i < $(this).prop('files').length; i++) {
        // unique id per file
        let file_id = uniqid();
        // input name
        let input_name = $(this).attr('data-name') + "[]";
        // file div
        let markup = '<div class="attachment_file_upload mb-2" id="' + file_id + '">' +
            '<span class="delete_file"><i class="fa fa-times"></i></span>' +
            '<div class="file_info">' +
            '<a href="#"><span class="file_name"></span></a>' +
            '<input class="uploaded_file_path" type="hidden" name="' + input_name + '">' +
            '</div>' +
            '<div class="progress">' +
            '<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>' +
            '</div>' +
            '</div>';

        target.find('.uploaded_files').append(markup).sortable();

        // prepare data
        let formData = new FormData();
        formData.append('file', $(this).prop('files')[i]);
        formData.append('file_type', 'attachment');
        if($(this).closest('.attachments').find('.custom_validation').length) {
            formData.append('validation', $(this).closest('.attachments').find('.custom_validation').val());
        }
        if($(this).closest('.attachments').find('.custom_disk').length) {
            formData.append('disk', $(this).closest('.attachments').find('.custom_disk').val());
        }
        // let fail_message = '<span class="ltr">آپلود فایل ' + $(this).prop('files')[i].name + ' با خطا مواجه شد.</span>';
        // send request
        $.ajax({
            url: upload_url,
            async: true,
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            type: 'post',
            success: function (response) {
                if (response.status == 200) {
                    $('#' + file_id).find('.file_name').text(response.file_name);
                    $('#' + file_id).find('a').attr('href', response.file_url);
                    $('#' + file_id).find('.uploaded_file_path').val(response.file_key);
                    $('#' + file_id).find('.progress').remove();
                    alertify.success('بارگذاری با موفقیت انجام شد.');
                }
            },
            error: function (response) {
                $('.attachment_file_upload').filter('#'+file_id).remove();
                if (response.status == 422) {
                    let response_text = $.parseJSON(response.responseText);
                    let text = response_text.errors.file[0];
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status >= 500) {
                    let text = 'در سمت سرور خطایی بوجود آمده است.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 403) {
                    let text = 'شما دسترسی انجام عملیات بارگذاری را ندارید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 401) {
                    let text = 'قبل از انجام درخواست بارگذاری وارد برنامه شوید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                }
            },
            xhr: function () {
                let myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener(
                        'progress',
                        function (e) {
                            progress(e, file_id);
                        },
                        false);
                }
                return myXhr;
            }
        });
    }

    $(this).val('');
});

$('.attachments').on('click', '.delete_file', function () {
    let target = $(this).closest('.attachment_file_upload ');
    let remove_url = $(this).closest('.attachments').find('.attachment_upload').data('remove');
    let id = target.find('.uploaded_file_path').val();
    let type = 'attachment';

    Swal.fire({
        title: 'آیا برای حذف اطمینان دارید؟',
        icon: 'warning',
        showCancelButton: true,
        customClass: {
            confirmButton: 'btn btn-danger mx-2',
            cancelButton: 'btn btn-light mx-2'
        },
        buttonsStyling: false,
        confirmButtonText: 'حذف',
        cancelButtonText: 'لغو',
        showClass: {
            popup: 'animated fadeInDown'
        },
        hideClass: {
            popup: 'animated fadeOutUp'
        }
    })
        .then((result) => {
            if(result.isConfirmed) {
                if(id == '') {
                    target.remove();
                    Swal.fire({
                        icon: 'success',
                        text: 'عملیات حذف با موفقیت انجام شد.',
                        confirmButtonText:'تایید',
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        buttonsStyling: false,
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else {
                    Swal.fire({
                        title: 'در حال اجرای درخواست',
                        icon: 'info',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        onOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    $.ajax({
                        type: 'post',
                        url: remove_url,
                        dataType: 'json',
                        data: {
                            object_id: id,
                            object_type: type
                        },
                        success: function(response) {
                            target.remove();
                            Swal.fire({
                                icon: 'success',
                                text: 'عملیات حذف با موفقیت انجام شد.',
                                confirmButtonText:'تایید',
                                customClass: {
                                    confirmButton: 'btn btn-success',
                                },
                                buttonsStyling: false,
                                showClass: {
                                    popup: 'animated fadeInDown'
                                },
                                hideClass: {
                                    popup: 'animated fadeOutUp'
                                }
                            })
                        },
                        error: function(response){
                            if( response.status == 422 ) {
                                let response_text = $.parseJSON( response.responseText );
                                Swal.fire({
                                    icon: 'error',
                                    html: response_text.errors.object_id[0],
                                    confirmButtonText:'تایید',
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    buttonsStyling: false,
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status >= 500) {
                                let error = $.parseJSON(response.responseText);
                                let text = (error.tag == 'invalid') ? error.message : 'در سمت سرور خطایی بوجود آمده است.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status == 403) {
                                let text = 'شما دسترسی انجام عملیات حذف را ندارید.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
});

// Videos
$('.video_upload').change(function () {

    let target = $(this).closest('.videos');
    let upload_url = $(this).data('upload');

    if (!$(this).prop('multiple') && target.find('.video_file_upload').length > 0) {
        Swal.fire({
            title: 'خطا در بارگذاری فایل',
            text: 'برای آپلود فایل جدید باید ابتدا فایل فعلی را حذف کنید.',
            icon: 'error',
            confirmButtonText: 'تایید',
            customClass: {
                confirmButton: 'btn btn-success',
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animated fadeInDown'
            },
            hideClass: {
                popup: 'animated fadeOutUp'
            }
        });

        $(this).val('');
        return;
    }

    for (let i = 0; i < $(this).prop('files').length; i++) {
        // unique id per file
        let file_id = uniqid();
        // input name
        let input_name = $(this).attr('data-name') + "[]";
        // caption name
        let caption_input_name = $(this).attr('data-name') + '_caption' + "[]";

        // caption div
        let caption_markup = '<div class="file_caption rtl my-1"><div class="row"><div class="col">' +
            '<label>عنوان</label>' +
            '<input type="text" class="form-control" name="' + caption_input_name + '" placeholder="اختیاری">' +
            '</div></div></div>';

        // file div
        let markup = '<div class="video_file_upload mb-2" id="' + file_id + '">' +
            '<span class="delete_file"><i class="fa fa-times"></i></span>' +
            '<div class="file_info">' +
            '<a href="#"><span class="file_name"></span></a>' +
            '<input class="uploaded_file_path" type="hidden" name="' + input_name + '">' +
            '</div>' +
            '<div class="progress">' +
            '<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>' +
            '</div>' +
            '</div>';

        target.find('.video_files').append(markup).sortable();

        // prepare data
        let formData = new FormData();
        formData.append('file', $(this).prop('files')[i]);
        formData.append('file_type', 'video');
        if($(this).closest('.videos').find('.custom_validation').length) {
            formData.append('validation', $(this).closest('.videos').find('.custom_validation').val());
        }
        if($(this).closest('.videos').find('.custom_disk').length) {
            formData.append('disk', $(this).closest('.videos').find('.custom_disk').val());
        }
        // let fail_message = '<span class="ltr">آپلود فایل ' + $(this).prop('files')[i].name + ' با خطا مواجه شد.</span>';
        // send request
        $.ajax({
            url: upload_url,
            async: true,
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            type: 'post',
            success: function (response) {
                if (response.status == 200) {
                    $('#' + file_id).find('.file_name').text(response.file_name);
                    $('#' + file_id).find('a').attr('href', response.file_url);
                    $('#' + file_id).find('.uploaded_file_path').val(response.file_key);
                    $('#' + file_id ).append(caption_markup);
                    $('#' + file_id).find('.progress').remove();
                    alertify.success('بارگذاری با موفقیت انجام شد.');
                }
            },
            error: function (response) {
                $('.video_file_upload').filter('#'+file_id).remove();
                if (response.status == 422) {
                    let response_text = $.parseJSON(response.responseText);
                    let text = response_text.errors.file[0];
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status >= 500) {
                    let text = 'در سمت سرور خطایی بوجود آمده است.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 403) {
                    let text = 'شما دسترسی انجام عملیات بارگذاری را ندارید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else if (response.status == 401) {
                    let text = 'قبل از انجام درخواست بارگذاری وارد برنامه شوید.';
                    Swal.fire({
                        title: 'خطا در آپلود فایل',
                        html: text,
                        icon: 'error',
                        confirmButtonText: 'تایید',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                }
            },
            xhr: function () {
                let myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener(
                        'progress',
                        function (e) {
                            progress(e, file_id);
                        },
                        false);
                }
                return myXhr;
            }
        });
    }

    $(this).val('');
});

$('.videos').on('click', '.delete_file', function () {
    let target = $(this).closest('.video_file_upload ');
    let remove_url = $(this).closest('.videos').find('.video_upload').data('remove');
    let id = target.find('.uploaded_file_path').val();
    let type = 'video';

    Swal.fire({
        title: 'آیا برای حذف اطمینان دارید؟',
        icon: 'warning',
        showCancelButton: true,
        customClass: {
            confirmButton: 'btn btn-danger mx-2',
            cancelButton: 'btn btn-light mx-2'
        },
        buttonsStyling: false,
        confirmButtonText: 'حذف',
        cancelButtonText: 'لغو',
        showClass: {
            popup: 'animated fadeInDown'
        },
        hideClass: {
            popup: 'animated fadeOutUp'
        }
    })
        .then((result) => {
            if(result.isConfirmed) {
                if(id == '') {
                    target.remove();
                    Swal.fire({
                        icon: 'success',
                        text: 'عملیات حذف با موفقیت انجام شد.',
                        confirmButtonText:'تایید',
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        buttonsStyling: false,
                        showClass: {
                            popup: 'animated fadeInDown'
                        },
                        hideClass: {
                            popup: 'animated fadeOutUp'
                        }
                    })
                } else {
                    Swal.fire({
                        title: 'در حال اجرای درخواست',
                        icon: 'info',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        onOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    $.ajax({
                        type: 'post',
                        url: remove_url,
                        dataType: 'json',
                        data: {
                            object_id: id,
                            object_type: type
                        },
                        success: function(response) {
                            target.remove();
                            Swal.fire({
                                icon: 'success',
                                text: 'عملیات حذف با موفقیت انجام شد.',
                                confirmButtonText:'تایید',
                                customClass: {
                                    confirmButton: 'btn btn-success',
                                },
                                buttonsStyling: false,
                                showClass: {
                                    popup: 'animated fadeInDown'
                                },
                                hideClass: {
                                    popup: 'animated fadeOutUp'
                                }
                            })
                        },
                        error: function(response){
                            if( response.status == 422 ) {
                                let response_text = $.parseJSON( response.responseText );
                                Swal.fire({
                                    icon: 'error',
                                    html: response_text.errors.object_id[0],
                                    confirmButtonText:'تایید',
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    buttonsStyling: false,
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status >= 500) {
                                let text = 'در سمت سرور خطایی بوجود آمده است.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            } else if(response.status == 403) {
                                let text = 'شما دسترسی انجام عملیات حذف را ندارید.';
                                Swal.fire({
                                    title: 'خطا در آپلود فایل',
                                    html: text,
                                    icon: 'error',
                                    confirmButtonText: 'تایید',
                                    buttonsStyling: false,
                                    customClass: {
                                        confirmButton: 'btn btn-success',
                                    },
                                    showClass: {
                                        popup: 'animated fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animated fadeOutUp'
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
});

function progress(e, file_id) {
    if (e.lengthComputable) {
        let max = e.total;
        let current = e.loaded;
        let percentage = (current * 100) / max;
        $('#' + file_id).find('.progress .progress-bar')
            .animate({'width': percentage + '%'}, 10)
            .text(percentage.toPrecision(3) + '%');

        if (percentage >= 100) {
        }
    }
}
