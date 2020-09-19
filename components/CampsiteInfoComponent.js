import React, { Component } from 'react';
import { Text, TextInput, View, ScrollView, FlatList, Modal, Button, StyleSheet } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from "../shared/baseUrl";
import { postFavorite } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId))
};

function RenderCampsite(props) {

    const {campsite} = props;
    
    if (campsite) {
        return (
            <Card 
                featuredTitle={campsite.name}
                image={{ uri: baseUrl + campsite.image}}>
                <Text style={{margin:10}}>
                    {campsite.description}
                </Text>
                    <View style={styles.cardRow}>
                        <Icon 
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ? console.log('Already set as a fasvorite') : props.markFavorite()}
                        />
                        <Icon 
                            style={styles.cardItem}
                            name='pencil'
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />    
                    </View>
            </Card>
        );
    }
    return <View />;
}

function RenderComments({comments}) {

    const renderCommentItem = ({item}) => {
        return(
            <View style={{margin:10}}>
                <Text style={{fontSize: 14}}>{item.text}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };

    return(
        <Card title='Comments'>
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item =>item.id.toString()}
            />
        </Card>
    );
}

class CampsiteInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating: 5,
            author: '',
            text: ''
        }
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    //what am I doing here??? - yep, think I got it... task 2
    handleComment(campsiteId) {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            rating: 5,
            author: '',
            text: ''
        });
    }
    //what am I doing here??? - yep, think I got it... task 2

    //am i using TextInput correctly and in the right place?

    
    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    static navigationOptions = {
        title: 'Campsite Information'
    }

    render() {
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite} 
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    //is this the right place to put this onShowModal prop? task 1//
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments comments={comments} />
                <Modal //rating and text modal task 1//
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modalStyle} /* oy vey - more shiznit for task 2 */>
                        <View>
                            <Rating //holy crap it works!!
                                imageSize={40} //check
                                type='star' //check
                                startingValue={this.state.rating} //check
                                style={{paddingVertical: 10}} //check
                                onFinishRating={(rating)=>this.setState({rating: rating})} //check
                                // don't need fractions={0}
                                ratingCount={5} //check
                                showRating //check
                            />
                            <Input
                                placeholder='Author' 
                                leftIcon={
                                    <Icon
                                    name='user-o'
                                    type='font-awesome'
                                    containerStyle={{paddingRight: 10}}
                                    size={24}
                                    color='black'
                                    />
                                }
                            />
                            
                            <Input
                                placeholder='Comment'
                                leftIcon={
                                    <Icon
                                    name='comment-o'
                                    type='font-awesome'
                                    containerStyle={{paddingRight: 10}}
                                    size={24}
                                    color='black'
                                    />
                                }
                            />
                            <Button
                                color='#5637DD'
                                title='Submit'
                                onPress={() => {
                                    this.handleComment(campsiteId); //campsiteId argument in the right place??
                                    this.resetForm();
                                }} 
                            />
                            <View /* is this right place for this "inline style task 1" */ style={{margin: 10}}>
                                <Button
                                    onPress={() => {
                                        this.toggleModal();
                                        this.resetForm();
                                    }}
                                    color='#808080'
                                    title='Cancel'
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    cardItem: {
        flex: 1,
        margin: 10
    },
    modalStyle: {
        justifyContent: 'center',
        margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);

/*
deleted from copied over reservation modal - still need? task 1
<Text style={styles.modalTitle}>Search Campsite Reservations</Text>
<Text style={styles.modalText}>Number of Campers: {this.state.campers}</Text>
<Text style={styles.modalText}>Hike-In?: {this.state.hikeIn ? 'Yes' : 'No'}</Text>
<Text style={styles.modalText}>Date: {this.state.date}</Text>
*/