// 设置main元素的高度为视口高度 适配移动端
window.addEventListener('resize', () => {
    updateMainElementHeight();
});

function updateMainElementHeight() {
    const mainElement = document.getElementById('main');
    const viewportHeight = window.innerHeight;
    mainElement.style.height = `${viewportHeight - 70}px`;
}

// 点击箭头切换子菜单的显示状态
document.querySelectorAll('#arrow').forEach(item => {
    item.addEventListener('click', function (event) {
        const submenu = $(this).parent().parents(".main-nav-item").children(".submenu");
        const isSubMenuVisible = submenu.css("display") !== "none";

        // 切换图标类
        this.classList.toggle('icon_rotate', !isSubMenuVisible);
        this.classList.toggle('icon_rotate_back', isSubMenuVisible);

        // 切换子菜单显示状态
        if (isSubMenuVisible) {
            submenu.slideUp();
            hideSidebarItems(submenu);
        } else {
            submenu.slideDown();
            showSidebarItems(submenu);
        }
    });
});

// 定义显示子菜单项的函数
function showSidebarItems(submenu) {
    submenu.children().each((index, element) => {
        setTimeout(() => {
            $(element).addClass('sidebar_show');
        }, index * 50); // 每次延迟 50 毫秒
    });
}

// 定义隐藏子菜单项的函数
function hideSidebarItems(submenu) {
    submenu.children().each((index, element) => {
        $(element).removeClass('sidebar_show');
    });
}

// 页面加载完成后显示所有菜单项
window.onload = function () {
    updateMainElementHeight();
    document.querySelectorAll('.main-nav-list').forEach(item => {
        Array.from(item.children).forEach((element, index) => {
            setTimeout(() => {
                $(element).addClass('sidebar_show'); // 添加 sidebar_show 类
                $(element).css('display', 'block'); // 设置 display 为 block
                $(element).css('opacity', 1);
            }, index * 50); // 每次延迟 50 毫秒
        });
    });
}

function toggleMenu() {
    const $mainNav = $('#main-nav');
    if ($mainNav.hasClass('hide')) {
        $mainNav.removeClass('hide').addClass('show');
    } else {
        $mainNav.removeClass('show').addClass('hide');
    }
}
