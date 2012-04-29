module.exports = {

    on_process:function (rs) {
      //  console.log('on_response o fcontroller_config')
        this.on_output(rs, {qaay:this.get_config("qaay", -1),
            bar:this.get_config("bar", -1),
            vole:this.get_config("vole", -1)})
    }

}