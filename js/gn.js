new NBSPace({
    input: 'textarea[name="input"]',
    output: 'textarea[name="output"]'
});

function NBSPace(options) {

    // Oxford says in page 140 that "Do not carry over parts of abbreviations, dates, or numbers to the next line", "Do not break numbers at a decimal point, or separate them from their abbreviated units, as with 15 kg or 300 BC. If unavoidable large numbers may be broken (but not hyphenated) at their comma, though not after a single digit: 493,|000,|000."

    const input = $(options.input);
    const output = $(options.output);
    const specialInput = $('#special');
    const showSource = $('input[name="show_source"]');
    const btnCopy = $('button[name="copy"]');

    const dictionary = {
        en: [
            'a',
            'about',
            'above',
            'across',
            'after',
            'against',
            'along',
            'among',
            'an',
            'around',
            'as',
            'at',
            'before',
            'behind',
            'below',
            'beneath',
            'beside',
            'between',
            'beyond',
            'but',
            'by',
            'concerning',
            'considering',
            'despite',
            'down',
            'during',
            'except',
            'for',
            'from',
            'in',
            'inside',
            'into',
            'Jr.',
            'like',
            'Miss',
            'Mr',
            'Mr.',
            'Mrs',
            'Mrs.',
            'Ms',
            'Ms.',
            'near',
            'of',
            'off',
            'on',
            'onto',
            'out',
            'outside',
            'over',
            'past',
            'regarding',
            'round',
            'since',
            'St.',
            'the',
            'through',
            'throughout',
            'to',
            'toward',
            'under',
            'underneath',
            'until',
            'up',
            'upon',
            'with',
            'within',
            'without'
        ]
    };

    const specialNames = [
        'Nordskill',
        'Oleksii Segodin'
    ];
    let eolSymbol = null;
    let paragraphs = [];

    specialInput.value = specialNames.join(', ');

    const rules = {

        multiple_spaces: (string) => {

            return string.replace(/[ ]{2,}/g, ' ');

        },
        numbers_space: (string) => {
            return string.replace(/(\d) (?=\S)/g, '$1&nbsp;');
        },  
        punctuation_space: (string) => {

            string = string.replaceAll(' .', '.');
            string = string.replace(/\.(?=[^\s])/g, '. ');
            string = string.replace(/(\.\s[a-z])/g, str => str.toUpperCase());

            string = string.replaceAll(' ,', ',');
            string = string.replace(/\,(?=[^\s])/g, ', ');

            string = string.replaceAll(' :', ':');
            string = string.replace(/\:(?=[^\s])/g, ': ');

            string = string.replaceAll(' ;', ';');
            string = string.replace(/\;(?=[^\s])/g, '; ');

            return string;

        },
        mdash: (string) => {

            return string.replaceAll(' - ', '&nbsp;— ');

        },
        last_space: (string) => {

            return string.replace(/ (?=[^ ]*$)/, '&nbsp;');

        },
        dictionary: (string) => {

            dictionary.en.forEach(str => {
                string = string.replaceAll(` ${str} `, ` ${str}&nbsp;`);
            });

            return string;

        },
        special: (string) => {

            const array = specialInput.value.split(',').map(s => s.trim());

            array.forEach(phrase => {

                const search = `\\b${phrase}\\b`;
                const regex = new RegExp(search, 'gi');
                string = string.replace(regex, () => {
                    return nonBreakable(phrase);
                });

            });

            return string;

            function nonBreakable(string) {

                return string.replaceAll(' ', '&nbsp;');

            }

        },
    };

    output.innerHTML = correct(input.value);
    input.onchange = input.onkeyup = specialInput.onchange = specialInput.onkeyup = showSource.onchange = () => {

        eolSymbol = null;
        paragraphs = [];

        if (showSource.checked) {
            output.innerText = correct(input.value);
        } else {
            output.innerHTML = correct(input.value);
        }

    }

    btnCopy.onclick = () => {

        if (output.value) {
            navigator.clipboard.writeText(output.value).then(success, fail);
        }

        function success() {

            const ANIMATION_DURATION = 1500;
            btnCopy.classList.add('success');


            setTimeout(() => {
                btnCopy.classList.remove('success');
            }, ANIMATION_DURATION);

        }
        function fail() {
            console.error('clipboard write failed');
        }

    }

    function correct(string) {

        if (!string) string = input.value;

        if (string.match(/(\r\n|\n|\r)/)) eolSymbol = string.match(/(\r\n|\n|\r)/)[0];

        paragraphs = getParagraphsArray(string);

        paragraphs = paragraphs.map(rules.multiple_spaces);
        paragraphs = paragraphs.map(rules.punctuation_space);
        paragraphs = paragraphs.map(rules.mdash);
        paragraphs = paragraphs.map(rules.special);
        paragraphs = paragraphs.map(rules.last_space);
        paragraphs = paragraphs.map(rules.numbers_space);
        paragraphs = paragraphs.map(rules.dictionary);

        return paragraphs.join('');

    }
    function getParagraphsArray(string) {

        let paragraphs = [];

        let sequenceOfBreaks = 0;
        const textLines = string.split(eolSymbol);
        const trimmedParagraphs = textLines.map(p => p.trim());

        let i = 0;
        while (trimmedParagraphs[i] === '') {
            trimmedParagraphs.shift();
        }

        let j = trimmedParagraphs.length;
        while (trimmedParagraphs[j - 1] === '') {
            trimmedParagraphs.pop();
            j--;
        }

        for (let i = 0; i < trimmedParagraphs.length; i++) {

            let p = trimmedParagraphs[i];

            if (p === '') {
                p = eolSymbol;
                sequenceOfBreaks++;
            } else {
                sequenceOfBreaks = 0;
            }

            if (sequenceOfBreaks > 1) continue;

            if (p !== eolSymbol && i + 1 < trimmedParagraphs.length) {
                paragraphs.push(p + eolSymbol);
            } else {
                paragraphs.push(p);
            }

        }

        return paragraphs;

    }
    function $(selector) {
        return document.querySelector(selector);
    }

}