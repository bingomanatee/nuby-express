module.exports = {

    on_process:function (rs) {
        this.on_output(rs, {dum:this.get_config("dum", [], true)})
    }

}