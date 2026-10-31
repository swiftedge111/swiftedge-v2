/* Country, phone and WhatsApp/Telegram contact fields, shared by the signup
   form, the complete-profile page and the profile card in Settings.

   Needs intl-tel-input (the intlTelInputWithUtils bundle) loaded first.
   Expected markup inside `root`:
     [data-country-select]   wrapper holding a text input and a [role=listbox]
     input[data-phone="primary"]
     input[data-phone="contact"]
     button[data-copy-phone] copies the primary number into the contact field

   Usage:
     const fields = ContactFields.init(form);
     const error = fields.validate();     // first problem as a message, or null
     const values = fields.getValues();   // { countryCode, phone, contactPhone }
*/
(function () {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

    // Same list the phone dropdowns use, so names and flags always match.
    const COUNTRIES = intlTelInput.getAllCountries()
        .map(c => ({
            iso2: c.iso2,
            dialCode: c.dialCode,
            name: displayNames.of(c.iso2.toUpperCase()) || c.iso2.toUpperCase()
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const PHONE_ERRORS = {
        TOO_SHORT: 'is too short',
        TOO_LONG: 'is too long',
        INVALID_COUNTRY_CODE: 'has an invalid country code'
    };

    // Lowercase and strip accents so "cote" finds "Côte d'Ivoire".
    function fold(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    function findCountry(iso2) {
        const code = (iso2 || '').toLowerCase();
        return COUNTRIES.find(c => c.iso2 === code) || null;
    }

    function searchCountries(query) {
        const q = fold(query);
        if (!q) return COUNTRIES;

        const digits = q.replace(/^\+/, '');
        const startsWith = [];
        const contains = [];
        COUNTRIES.forEach(c => {
            const name = fold(c.name);
            if (name.startsWith(q) || c.iso2 === q) startsWith.push(c);
            else if (name.includes(q) || (/^\d+$/.test(digits) && c.dialCode.startsWith(digits))) contains.push(c);
        });
        return startsWith.concat(contains);
    }

    function setupCountrySelect(wrapper, onChoose) {
        const input = wrapper.querySelector('input');
        const list = wrapper.querySelector('[role="listbox"]');
        const flag = wrapper.querySelector('.country-select__flag');

        let selected = null;
        let shown = [];
        let active = -1;

        function setActive(index) {
            const items = list.querySelectorAll('.country-select__option');
            if (items[active]) items[active].classList.remove('is-active');
            active = index;
            const item = items[active];
            if (item) {
                item.classList.add('is-active');
                input.setAttribute('aria-activedescendant', item.id);
                item.scrollIntoView({ block: 'nearest' });
            } else {
                input.removeAttribute('aria-activedescendant');
            }
        }

        function render(query) {
            shown = searchCountries(query);
            list.innerHTML = '';

            if (shown.length === 0) {
                const empty = document.createElement('li');
                empty.className = 'country-select__empty';
                empty.textContent = 'No country found';
                list.appendChild(empty);
                setActive(-1);
                return;
            }

            const fragment = document.createDocumentFragment();
            shown.forEach((country, index) => {
                const item = document.createElement('li');
                item.className = 'country-select__option';
                item.id = `${list.id}-${country.iso2}`;
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', String(selected === country));
                item.dataset.index = index;

                const itemFlag = document.createElement('span');
                itemFlag.className = `iti__flag iti__${country.iso2}`;
                const name = document.createElement('span');
                name.className = 'country-select__name';
                name.textContent = country.name;
                const dial = document.createElement('span');
                dial.className = 'country-select__dial';
                dial.textContent = `+${country.dialCode}`;

                item.append(itemFlag, name, dial);
                fragment.appendChild(item);
            });
            list.appendChild(fragment);

            const selectedIndex = shown.indexOf(selected);
            setActive(query ? 0 : selectedIndex);
        }

        function open() {
            if (!list.hidden) return;
            list.hidden = false;
            input.setAttribute('aria-expanded', 'true');
            wrapper.classList.add('is-open');
            render(selected && input.value === selected.name ? '' : input.value);
        }

        function close() {
            list.hidden = true;
            input.setAttribute('aria-expanded', 'false');
            wrapper.classList.remove('is-open');
            setActive(-1);
            // Free text never counts: fall back to the last real choice.
            input.value = selected ? selected.name : '';
        }

        function choose(country) {
            selected = country;
            input.value = country ? country.name : '';
            flag.className = country ? `country-select__flag iti__flag iti__${country.iso2}` : 'country-select__flag';
            wrapper.classList.toggle('has-country', Boolean(country));
            const group = wrapper.closest('.input-group, .form-group');
            if (group) group.classList.remove('input-error');
            if (country) onChoose(country);
        }

        input.addEventListener('focus', () => {
            open();
            input.select();
        });
        input.addEventListener('click', open);
        input.addEventListener('input', () => {
            if (list.hidden) open();
            render(input.value);
        });
        input.addEventListener('blur', close);

        input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (list.hidden) open();
                    else setActive(Math.min(active + 1, shown.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActive(Math.max(active - 1, 0));
                    break;
                case 'Enter':
                    if (!list.hidden) {
                        e.preventDefault();
                        if (shown[active]) {
                            choose(shown[active]);
                            input.blur();
                        }
                    }
                    break;
                case 'Escape':
                    if (!list.hidden) {
                        e.preventDefault();
                        input.blur();
                    }
                    break;
            }
        });

        // mousedown, not click: it fires before the input's blur closes the list.
        list.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const item = e.target.closest('.country-select__option');
            if (!item) return;
            choose(shown[Number(item.dataset.index)]);
            input.blur();
        });

        return {
            get: () => selected,
            set: (iso2) => choose(findCountry(iso2)),
            input
        };
    }

    function createPhoneInput(input) {
        return intlTelInput(input, {
            initialCountry: '',
            countrySearch: true,
            // The form sits in containers with overflow: hidden, which would
            // clip a dropdown rendered inline.
            dropdownParent: document.body
        });
    }

    function init(root) {
        const primaryInput = root.querySelector('[data-phone="primary"]');
        const contactInput = root.querySelector('[data-phone="contact"]');
        const copyButton = root.querySelector('[data-copy-phone]');
        const primary = createPhoneInput(primaryInput);
        const contact = createPhoneInput(contactInput);

        // Picking a country presets the dial code on phone fields that don't
        // have one yet; numbers the user already typed with a code are left alone.
        const country = setupCountrySelect(root.querySelector('[data-country-select]'), (chosen) => {
            [primary, contact].forEach(iti => {
                if (!iti.getSelectedCountry()) iti.setSelectedCountry(chosen.iso2);
            });
        });

        // And the other way round: a dial code picked first fills in the country.
        primaryInput.addEventListener('countrychange', () => {
            const picked = primary.getSelectedCountry();
            if (picked && !country.get()) country.set(picked.iso2);
        });

        [primaryInput, contactInput].forEach(input => {
            input.addEventListener('input', () => clearError(input));
        });

        copyButton.addEventListener('click', () => {
            const number = primary.getNumber(intlTelInput.NUMBER_FORMAT.E164);
            if (!primaryInput.value.trim() || !number) {
                markError(primaryInput);
                primaryInput.focus();
                return;
            }
            contact.setNumber(number);
            clearError(contactInput);
        });
        function fieldGroup(element) {
            return element.closest('.input-group, .form-group');
        }

        function markError(element) {
            const group = fieldGroup(element);
            if (group) group.classList.add('input-error');
        }

        function clearError(element) {
            const group = fieldGroup(element);
            if (group) group.classList.remove('input-error');
        }

        function phoneProblem(iti, input, label) {
            if (!input.value.trim()) return `${label} is required`;
            if (!iti.getSelectedCountry()) return `Please select the country code for your ${label.toLowerCase()}`;
            if (iti.isValidNumberPrecise()) return null;
            const reason = PHONE_ERRORS[iti.getValidationError()];
            return reason ? `${label} ${reason}` : `Please enter a valid ${label.toLowerCase()}`;
        }

        return {
            // Returns the first problem in form order (and highlights that
            // field), or null when everything is valid.
            validate() {
                if (!country.get()) {
                    markError(country.input);
                    return 'Please select your country';
                }
                const checks = [
                    [primary, primaryInput, 'Phone number'],
                    [contact, contactInput, 'Contact phone number (WhatsApp / Telegram)']
                ];
                for (const [iti, input, label] of checks) {
                    const problem = phoneProblem(iti, input, label);
                    if (problem) {
                        markError(input);
                        return problem;
                    }
                }
                return null;
            },

            getValues() {
                const selected = country.get();
                return {
                    countryCode: selected ? selected.iso2.toUpperCase() : '',
                    phone: primary.getNumber(intlTelInput.NUMBER_FORMAT.E164),
                    contactPhone: contact.getNumber(intlTelInput.NUMBER_FORMAT.E164)
                };
            },

            // Prefill from saved details. Old accounts may hold a phone typed
            // in any format; intl-tel-input recognises it when it carries a
            // +code, otherwise the user picks the code before saving.
            setValues({ countryCode, phone, contactPhone }) {
                if (phone) primary.setNumber(phone);
                if (contactPhone) contact.setNumber(contactPhone);
                if (countryCode) country.set(countryCode);
            }
        };
    }

    window.ContactFields = { init };
})();
