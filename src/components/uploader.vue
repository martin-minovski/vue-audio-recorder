<style lang="scss">
  @import '../scss/icons';
</style>

<template>
  <icon-button name="save" class="ar-icon ar-icon__xs ar-icon--no-border" @click.native="upload"/>
</template>

<script>
  import IconButton from './icon-button'
  import UploaderPropsMixin from '@/mixins/uploader-props'

  export default {
    mixins: [UploaderPropsMixin],
    props: {
      record:  { type: Object },
      method:  { type: String },
      formKey: { type: String }
    },
    components: {
      IconButton
    },
    methods: {
      upload () {
        if (!this.record.url) {
          return
        }

        this.$eventBus.$emit('start-upload')

        const data = new FormData()
        data.append(this.formKey, this.record.blob, `${this.filename}.wav`)

        const headers = Object.assign(this.headers, {})
        headers['Content-Type'] = `multipart/form-data; boundary=${data._boundary}`

        this.$http[this.method](this.uploadUrl, data, { headers: headers }).then(resp => {
          this.$eventBus.$emit('end-upload', { status: 'success', response: resp })
        }).catch(error => {
          this.$eventBus.$emit('end-upload', { status: 'fail', response: error })
        })
      }
    }
  }
</script>
