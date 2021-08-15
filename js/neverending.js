var loadingNextPage = false
var page = 1

function loadPage(page){
    var location = window.location.href
    if (location.split('/').pop().includes('page')){
        return null
    }
    var url = location + 'page-' + page
    $.ajax({
        url: url,
        async: true,
        type: "get",
        context: this,
        success: injectNewThreads,
        error: function(data){
            console.log("Erro catando a próxima pagina:", data)
        }
    });
}

function injectNewThreads(pageDataString){
    var pageData = $(pageDataString)
    var threads = pageData.find('.structItem--thread')
    var newThreads = ""
    threads.each((element, item) => {
        newThreads+= (item.outerHTML)
    });
    var threadsTable = document.getElementsByClassName('js-threadList')[0]
    threadsTable.innerHTML += newThreads
    loadingNextPage = false


}


function loadNextPage() {    
    if (!loadingNextPage){
        loadingNextPage = true
        page++
        loadPage(page)
    }
};

function injectNextPageButton(){
    var location = window.location.href
    if (location.split('/').pop().includes('page')){
        return null
    }
    var threadsEnd = $('.block-outer--after:first')
    var buttonNewPage = $("<button style='width: 100%; height:42px' id='newPageButton'>Carregar nova página</button>")
    buttonNewPage.insertBefore(threadsEnd)
    buttonNewPage.click(loadNextPage)
}


injectNextPageButton()
