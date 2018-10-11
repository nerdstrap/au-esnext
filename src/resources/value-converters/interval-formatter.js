import { inject, bindable, computedFrom, valueConverter } from 'aurelia-framework';
import { StringHelper } from 'util/string-helper';

@valueConverter("intervalFormatter")
export class intervalFormatterValueConverter {

    toView(value) {
        return StringHelper.formatInterval(value);
    }

}
