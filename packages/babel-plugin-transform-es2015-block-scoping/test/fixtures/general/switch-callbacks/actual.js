function fn() {
    switch (true) {
    default:
        let foo = 4;
        if (true) {
            let bar = () => foo;
            console.log(bar());
        }
    }
}
