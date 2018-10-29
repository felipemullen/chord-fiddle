(function () {

    const STORAGE_KEY_THEME = 'theme';

    window.colorSchemes = window.colorSchemes || {};
    window.colorSchemes['theme-dark'] = {
        '--nav': '#1c2128',
        '--nav-shadow': '#20262e',
        '--nav-text-bright': '#f7f7f7',
        '--nav-text-dim': '#6d747f',
        '--nav-text-hover': '#0a80ee',
        '--nav-border': '#315f9b',
        '--gutters': '#454952',
        '--gutter-border': '#20262e',
        '--editor-headers': '#2e353e',
        '--editor-headers-border': '#20262e',
        '--editor-headers-text': '#6d747f',
        '--editor-text': '#6d747f',
        '--editor-body': '#20262e',
        '--editor-form': '#1c2128',
        '--editor-form-text': '#6d747f',
        '--preview-text': '#f7f7f7',
        '--preview-chord-text': '#454952',
        '--preview-chord-bg': '#f7f7f7',
        '--footer-text': '#6e737f',
        '--footer-nav-bg': '#1d2129',
        '--footer-nav-border': '#315f9b',
        '--metronome-btn-bg': '#464952',
        '--metronome-btn-text': '#aeb0b2',
        '--tuner-btn-bg': '#315f9b',
        '--tuner-btn-bg-hover': '#0a80ee',
        '--tuner-btn-text': '#f7f7f7',
        '--tuner-btn-play': '#ee5a0a'
    };
    window.colorSchemes['theme-light'] = {
        '--nav': '#f5f5f5',
        '--nav-shadow': '#555555',
        '--nav-text-bright': '#3e3e3e',
        '--nav-text-dim': '#868686',
        '--nav-text-hover': '#176cd2',
        '--nav-border': '#315f9b',
        '--gutters': '#dfe4e2',
        '--gutter-border': '#afb7b7',
        '--editor-headers': '#f5f5f5',
        '--editor-headers-border': '#dfe4e2',
        '--editor-headers-text': '#3e3e3e',
        '--editor-text': '#3c3c3c',
        '--editor-body': '#f8f8f8',
        '--editor-form': '#efefef',
        '--editor-form-text': '#3c3c3c',
        '--preview-text': '#3e3e3e',
        '--preview-chord-text': '#f7f7f7',
        '--preview-chord-bg': '#315f9b',
        '--footer-text': '#20262e',
        '--footer-nav-bg': '#f7f7f7',
        '--footer-nav-border': '#315f9b',
        '--metronome-btn-bg': '#f7f7f7',
        '--metronome-btn-text': '#6d747f',
        '--tuner-btn-bg': '#315f9b',
        '--tuner-btn-bg-hover': '#0a80ee',
        '--tuner-btn-text': '#f7f7f7',
        '--tuner-btn-play': '#ee5a0a'
    };
    window.colorSchemes['theme-greenland'] = {
        '--nav': '#3bcdb4',
        '--nav-shadow': '#3e5c57',
        '--nav-text-bright': '#f7f7f7',
        '--nav-text-dim': '#c0fff3',
        '--nav-text-hover': '#0e7369',
        '--nav-border': '#43a698',
        '--gutters': '#dfe4e2',
        '--gutter-border': '#a5aab0',
        '--editor-headers': '#348d7c',
        '--editor-headers-border': '#1a4735',
        '--editor-headers-text': '#f7f7f7',
        '--editor-text': '#6d7f7f',
        '--editor-body': '#f8f8f8',
        '--editor-form': '#e3eae8',
        '--editor-form-text': '#6d7f7e',
        '--preview-text': '#6d747f',
        '--preview-chord-text': '#f7f7f7',
        '--preview-chord-bg': '#a5aab0',
        '--footer-text': '#20262e',
        '--footer-nav-bg': '#e3eae8',
        '--footer-nav-border': '#438b7b',
        '--metronome-btn-bg': '#438b7b',
        '--metronome-btn-text': '#f7f7f7',
        '--tuner-btn-bg': '#438b7b',
        '--tuner-btn-bg-hover': '#0e7369',
        '--tuner-btn-text': '#f7f7f7',
        '--tuner-btn-play': '#ee5a0a'
    };

    window.changeColors = function changeColors(selectElement) {
        const themeName = selectElement.value;
        const selectedTheme = window.colorSchemes[themeName];

        const htmlStyle = document.querySelector('html').style;
        for (const key in selectedTheme) {
            const color = selectedTheme[key];
            htmlStyle.setProperty(key, color);
        }

        window.localStorage.setItem(STORAGE_KEY_THEME, themeName);
    }

    const theme = window.localStorage.getItem(STORAGE_KEY_THEME);
    if (theme) {
        window.changeColors({ value: theme });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (theme)
            document.querySelector('#theme-select').value = theme;
    })
})();