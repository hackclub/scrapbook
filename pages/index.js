import {
  Box,
  IconButton,
  Container,
  Image,
  Text,
  Flex,
  Heading,
  Button,
  Grid,
  Avatar,
  Badge,
  Link as A
} from 'theme-ui'
import { keyframes } from '@emotion/core'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import Nav from '../components/nav'
import Icon from '../components/icon'
import Stat from '../components/stat'
import { timeSince } from '../lib/dates'

export default props => (
  <>
    <Meta
      as={Head}
      title="Summer of Making"
      description="Join Hack Club’s Summer of Making: professional mentorship, $50k in GitHub hardware grants, & an unparalleled online community. Starting June 18, ages 13–18."
      image="https://cdn.glitch.com/3899929b-9aed-4dae-b1e6-230ef0ed4d51%2Fsummer.jpg?v=1590594017411"
    />
    <Nav />
  </>
)

export const getStaticProps = async () => {
  const props = {}

  let options = {
    maxRecords: 1,
    sort: [{ field: 'Created at', direction: 'desc' }],
    filterByFormula: '{Approved for display} = 1'
  }
  let endpointURL = `https://api2.hackclub.com/v0.1/Pre-register/Applications?select=${JSON.stringify(
    options
  )}`

  try {
    let results = await fetch(endpointURL, { mode: 'cors' }).then(r => r.json())
    let reason = results[0].fields
    props.reason = reason['What do you want to learn?']
    props.time = reason['Created at']
    props.status = 'success'
  } catch (e) {
    props.status = 'error'
  }
  return { props, unstable_revalidate: 1 }
}
