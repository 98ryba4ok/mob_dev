describe('App basic flow', () => {
  it('launches app', async () => {
    await device.launchApp({ newInstance: true });
    await expect(element(by.text('Wordle RN'))).toBeVisible();
  });
});


