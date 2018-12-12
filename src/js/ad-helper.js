(function () {
    const fetchAd = firebase.functions().httpsCallable('fetchAd');
    let _adRollElement = null;

    window.expandAd = function (adWrapperElement) {
        adWrapperElement.style.height = '60%';
    };
    
    window.collapseAd = function (adWrapperElement) {
        adWrapperElement.style.height = null;
    };

    function displayAd(adData) {
        if (adData) {
            if (_adRollElement === null)
                _adRollElement = document.querySelector('#ad-roll');

            for (const child of _adRollElement.children) {
                child.remove();
            }

            const adAnchorElement = document.createElement('a');
            adAnchorElement.target = '_blank';
            adAnchorElement.href = adData.link;
            adAnchorElement.innerHTML = `
                <img src="${adData.imgSrc}" title="${adData.description}" />
            `;

            _adRollElement.appendChild(adAnchorElement);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        fetchAd().then((result) => {
            displayAd(result.data);
        })
    });
})();