import { expect, $ } from '@wdio/globals'

describe('Wails Testing', () => {
    it('should say hello', async function () {
        await $('~input').setValue('My Name')
        await $('~greet-btn').click()
        await expect($('~result').toHaveText('Hello My Name'))
    })
})

