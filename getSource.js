// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function getProducts(document_root) {
    products = []
    names = document_root.getElementsByClassName("av-card-description-text")
    products_html = document_root.getElementsByClassName("av-cardListingsCol");
    [...products_html].forEach((product_html,i) => {
        states = product_html.getElementsByClassName("av-card-stats-text");
        product = {}
        product.name = names[i].innerText;
        product.calls = states[0].innerText;
        product.views = states[1].innerText;
        product.messages = states[2].innerText;
        product.img = product_html.getElementsByClassName("av-card-image")[0].src;
        products.push(product)
    });
    return products;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: getProducts(document)
});

//code: "chrome.extension.sendRequest({content: document.body.innerHTML}, function(response) { console.log('success'); });"
