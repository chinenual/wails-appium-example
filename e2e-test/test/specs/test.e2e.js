import { expect, $ } from '@wdio/globals'

describe('Wails Testing', () => {
    it('should say hello', async function () {
        await $('~name').setValue('My Name')
        await $('~greet-button').click()
        await expect($('~result').toHaveText('Hello My Name'))
    })
})

